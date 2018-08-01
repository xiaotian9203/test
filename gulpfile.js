/* eslint-disable no-console */
var gulp = require('gulp');
var less = require('gulp-less');
var pug = require('gulp-pug');
var changed = require('gulp-changed');
var bom = require('gulp-bom');
var liveReload = require('gulp-livereload');
var replace = require('gulp-replace');
var yArgs = require('yargs');
var autoPrefix = require('gulp-autoprefixer');
var sourceMaps = require('gulp-sourcemaps');
var queue = require('streamqueue');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cleanCss = require('gulp-clean-css');
var filesExist = require('files-exist');
var gulpIf = require('gulp-if');
var runSequence = require('run-sequence');
var templateCache = require('gulp-angular-templatecache');
var ngAnnotate = require('gulp-ng-annotate');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var shell = require('shelljs');
var order = require('gulp-order');
var watch = require('gulp-watch');
var ecstatic = require('ecstatic');
var gulpUtil = require('gulp-util');
var http = require('http');

var config = require('./config/index').getConfig(yArgs.argv);

var build = {
    dist: 'dist/',
    assetsSrc: 'assets/**/*.*',
    lessSrc: [
        'src/components/**/*.less',
        'src/style/**/*.less',
    ],
    pugTemplateSrc: [
        'src/components/**/*.pug',
        'src/routes/**/*.pug',
    ],
    TEMPLATE_HEADER: 'angular.module("<%= module %>", []).run(["$templateCache", function($templateCache) {',
    pugEntrySrc: 'src/*.pug',
    jsLibSrc: [
        "node_modules/jquery/dist/jquery.js",
        "node_modules/angular/angular.js",
        "node_modules/angular-route/angular-route.js",
    ],
    jsConfigSrc: 'src/app.js',
    jsSrc: [
        'src/components/**/*.js',
        'src/routes/**/*.js',
        'src/script/**/*.js',
    ],
    imgHashFile: 'image-hash.json',
    cssJsHashFile: 'rev-css-js-manifest.json',
    liveReloadCode: '//- ##inject-live-reload##',
    liveReloadScript: 'script(src="http://localhost:35729/livereload.js?snipver=1")'
};

/**
 * 如果构建过程中发生错误导致监听任务中断，则尝试用该方法处理pipe中的error事件。
 * @param e
 */
var shallowError = function (e) {
    console.info(e);
    this.emit('end');
};

/**
 * 判断是否为开发状态
 * @returns {boolean}
 */
var isDev = function () {
    return !yArgs.argv.prod && !yArgs.argv.staging;
};


/**
 * 转移图片字体等资源
 */
gulp.task('assets', function () {
    return gulp.src(build.assetsSrc)
            .pipe(changed(build.dist))
            .pipe(gulp.dest(build.dist))
});

/**
 * less合并并转成css
 */
gulp.task('less', function () {
    return gulp.src(build.lessSrc)
        .pipe(gulpIf(!isDev(), order(build.lessSrc)))
        .pipe(concat('bundle.less'))
        .pipe(less())
        .on('error', shallowError)
        .pipe(autoPrefix())
        .pipe(gulpIf(!isDev(), cleanCss()))
        .pipe(gulp.dest(build.dist))
        .pipe(liveReload());
});

/**
 * 入口的index.pug单独专程index.html
 */
gulp.task('pugEntry', function () {
    return gulp.src(build.pugEntrySrc)
        .pipe(gulpIf(isDev(), replace(build.liveReloadCode, build.liveReloadScript)))
        .pipe(pug())
        .on('error', shallowError)
        .pipe(replace('##ASSETS_HOST##', config.assetsHost))
        .pipe(bom())
        .pipe(gulp.dest(build.dist))
        .pipe(liveReload());
});

/**
 * 其他组件和路由的模板pug将会转成html
 * 并使用gulp-angular-templatecache压成一本template.js
 */
gulp.task('pugTemplate', function () {
    // 开发才在这里合并模板，发布环境这里不合并，要等到后续进行文件hash替换后再进行合并
    // 开发环境下不会替换文件hash，所以在这里合并
    return isDev()
        ?
        gulp.src(build.pugTemplateSrc)
            .pipe(pug())
            .on('error', shallowError)
            .pipe(templateCache('template.js', {
                templateHeader: build.TEMPLATE_HEADER,
            }))
            .pipe(bom())
            .pipe(gulp.dest(build.dist))
            .pipe(liveReload())
        :
        gulp.src(build.pugTemplateSrc)
            .pipe(pug())
            .on('error', shallowError)
            .pipe(gulp.dest(build.dist + 'html/'));

});
/**
 * 真正的pug任务包含pugEntry和pugTemplate
 */
gulp.task('pug', ['pugEntry', 'pugTemplate']);

/**
 * 第三库的脚本合并
 */
gulp.task('jsVendor', function () {
    return gulp.src(filesExist(build.jsLibSrc))
        .pipe(gulpIf(isDev(), sourceMaps.init()))
        .pipe(concat('vendor.js'))
        .pipe(gulpIf(isDev(), sourceMaps.write(), uglify()))
        .on('error', function (err) {
            gulpUtil.log(gulpUtil.colors.red('[Error]'), err.toString());
        })
        .pipe(bom())
        .pipe(gulp.dest(build.dist));
});

/**
 * 自己的js代码合并压缩
 */
gulp.task('jsBundle', function () {
    var origin = 'window.CONFIG = window.CONFIG || {};';
    var real = 'window.CONFIG = ' + JSON.stringify(config);
    var configStream = gulp.src(build.jsConfigSrc)
        .pipe(replace(origin, real));
    var mainStream = gulp.src(build.jsSrc);
    return queue({objectMode: true}, configStream, mainStream)
        .pipe(gulpIf(!isDev(), ngAnnotate(), sourceMaps.init()))
        .pipe(concat('bundle.js', {newLine: ';///\n'}))
        .pipe(gulpIf(!isDev(), uglify(), sourceMaps.write()))
        .on('error', function (err) {
            gulpUtil.log(gulpUtil.colors.red('[Error]'), err.toString());
        })
        .pipe(bom())
        .pipe(gulp.dest(build.dist))
        .pipe(liveReload());
});
/**
 * 真正的js任务
 */
gulp.task('js', ['jsVendor', 'jsBundle']);

/**
 * hash任务会自动忽略所有字体文件
 * 计算出所有assets文件的hash并把hash追加到文件名后面
 * 同时把hash映射记录到指定的临时文件中，后面会用来替换引用该图片的地址
 * 要等assets完成才能执行
 */
gulp.task('imgHashInit', ['assets'], function () {
    return gulp.src(build.dist + 'images/**/*.*')
        .pipe(vinylPaths(function (paths) {
            return del(paths, {force: true});
        }))
        .pipe(rev())
        .pipe(gulp.dest(build.dist + 'images/'))
        .pipe(rev.manifest(build.imgHashFile))
        .pipe(gulp.dest(build.dist));
});

/**
 * 使用存在文件中的hash映射去替换其他文件中引用图片资源的地址
 */
gulp.task('imgHash', ['imgHashInit'], function () {
    var manifest = gulp.src(build.dist + build.imgHashFile);
    return gulp.src([
        build.dist + 'index.js',
        build.dist + '**/*.css',
        build.dist + '**/*.html',
        '!' + build.dist + 'lib/**/*.css'])
        .pipe(revReplace({manifest: manifest}))
        .pipe(bom())
        .pipe(gulp.dest(build.dist))
        .on('end', function () {
            // 结束后删除hash文件
            // 后续任务并不需要等待删除结束才进行
            shell.exec('rm ' + build.dist + build.imgHashFile);
        });
});

/**
 * 发布模式下把组件模板合并
 */
gulp.task('ngTemplate', ['imgHash', 'pug'], function () {
    return gulp.src(build.dist + 'html/**/*.html')
        .pipe(templateCache('template.js', {
            templateHeader: build.TEMPLATE_HEADER,
        }))
        .pipe(bom())
        .pipe(gulp.dest(build.dist))
        .on('end', function () {
            // 结束后删除零散的模板文件及目录，
            // 后续任务并不需要等待删除结束才进行
            shell.exec('rm -rf ' + build.dist + 'html');
        });
});

/**
 * 为css和js资源也生成hash
 */
gulp.task('cssJsHashInit', ['ngTemplate', 'js', 'less'], function () {
    return gulp.src([
        build.dist + '**/*.css',
        build.dist + '**/*.js',
        '!' + build.dist + 'plugin/*.*'])
        .pipe(vinylPaths(function (paths) {
            return del(paths, {force: true});
        }))
        .pipe(rev())
        .pipe(gulp.dest(build.dist))
        .pipe(rev.manifest(build.cssJsHashFile))
        .pipe(gulp.dest(build.dist));
});

/**
 * 引用css,js的地方也要替换成hash
 */
gulp.task('release', ['cssJsHashInit'], function () {
    var manifest = gulp.src(build.dist + build.cssJsHashFile);
    return gulp.src(build.dist + '*.html')
        .pipe(revReplace({manifest: manifest}))
        .pipe(bom())
        .pipe(gulp.dest(build.dist))
        .on('end', function () {
            // 结束后删除hash文件
            // 后续任务并不需要等待删除结束才进行
            shell.exec('rm ' + build.dist + build.cssJsHashFile);
        });
});

/**
 * 清除dist目录
 */
gulp.task('clean', function () {
    var distRoot = build.dist.substr(0, build.dist.length - 1);
    return del([build.dist + '**', '!' + distRoot], {force: true});
});

/**
 * 构建
 */
gulp.task('build', function () {
    return new Promise(function (resolve) {
        if (isDev()) {
            runSequence('clean',
                ['assets', 'less', 'pug', 'js'], resolve);
        } else {
            runSequence('clean', 'release', resolve);
        }
    });
});

/**
 * 开发模式下启动服务
 */
gulp.task('serve', ['build'], function () {
    liveReload.listen();
    watch(build.assetsSrc, function () {
        runSequence('assets');
    });
    watch(build.lessSrc, function () {
        runSequence('less');
    });
    watch(build.pugTemplateSrc, function () {
        runSequence('pugTemplate');
    });
    watch(build.pugEntrySrc, function () {
        runSequence('pugEntry');
    });
    watch(build.jsSrc.concat(build.jsConfigSrc), function () {
        runSequence('jsBundle');
    });

    var port = yArgs.argv.p || 4000;
    http.createServer(ecstatic({
        root: __dirname + '/dist',
        cors: true,
    })).listen(port);
    setTimeout(function () {
        console.log('build success');
        console.log('watching and serving at http://localhost:' + port);
        console.log('change port by running gulp -p xxxx');
    }, 500);
});
gulp.task('default', ['serve']);