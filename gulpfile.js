/* eslint-disable no-console */
var gulp = require('gulp');
var less = require('gulp-less');
var pug = require('gulp-pug');
var changed = require('gulp-changed');
var bom = require('gulp-bom');
var rename = require('gulp-rename');
var liveReload = require('gulp-livereload');
var replace = require('gulp-replace');
var yArgs = require('yargs');
var autoPrefix = require('gulp-autoprefixer');
var sourceMaps = require('gulp-sourcemaps');
var fs = require('fs');
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
var stream = require('stream');
var source = require('vinyl-source-stream');

var config = require('./config/index').getConfig(yArgs.argv);

var build = {
    configSrc: 'config',
    localConfigFile: './config/local.js',
    dist: 'dist/',
    langDist: './dist/lang',
    langSrc: './lang/code',
    assetsSrc: 'assets/**/*.*',
    lessSrc: [
        'src/component/**/*.less',
        'src/style/**/*.less',
    ],
    jadeTemplateSrc: 'src/component/**/*.jade',
    TEMPLATE_HEADER: 'angular.module("<%= module %>", []).run(["$templateCache", function($templateCache) {',
    jadeEntrySrc: 'src/*.jade',
    jsLibSrc: [
        "node_modules/jquery/dist/jquery.js",
        "node_modules/angular/angular.js",
        "node_modules/angular-animate/angular-animate.js",
        "node_modules/angular-sanitize/angular-sanitize.js",
        "node_modules/angular-cookies/angular-cookies.js",
        "node_modules/angular-translate/dist/angular-translate.js",
        "node_modules/angular-translate/dist/angular-translate-loader-partial/angular-translate-loader-partial.js",
        "node_modules/angular-translate/dist/angular-translate-storage-cookie/angular-translate-storage-cookie.js",
        "node_modules/angular-translate/dist/angular-translate-storage-local/angular-translate-storage-local.js",
    ],
    jsSrc: [
        'src/component/**/*.js',
        'src/script/**/*.js',
    ],
    imgHashFile: 'image-hash.json',
    cssJsHashFile: 'rev-css-js-manifest.json',
    uiPreviewSrc: 'ui-preview/**/*.*',
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
 * 多语言翻译文本
 */
gulp.task('lang', function () {
    return del(build.langDist + '/**').then(function () {
        var hash = '';
        var hashA = require('hasha');
        fs.readdirSync(build.langSrc).forEach(function (name) {
            var temp = hashA.fromFileSync(build.langSrc + '/' + name);
            hash += temp.substr(0, 4);
        });
        var appFile = './src/app.js';
        var text = fs.readFileSync(appFile).toString();
        var updated = text.replace(/lang\/{lang}\/{part}\w+.json/,
            'lang/{lang}/{part}' + hash + '.json');
        fs.writeFileSync(appFile, updated);
        var files = fs.readdirSync(build.langSrc);

        var tasks = [];

        files.forEach(function (file) {
            var path = build.langSrc + '/' + file;
            var match = file.match(/(\w+)\.js$/);
            if (fs.statSync(path).isFile() && match) {
                var lang = match[1];
                var langCode = eval(fs.readFileSync(build.langSrc + '/' + file)
                    .toString().replace('module.exports', 'langCode'));
                var dir = build.langDist + '/' + lang;
                tasks.push(new Promise(function (resolve) {
                    var readable = new stream.Readable();
                    var text = JSON.stringify(langCode);
                    readable.push(text);
                    readable.push(null);
                    readable.pipe(source(dir + '/main' + hash + '.json'))
                        .pipe(gulp.dest('.'))
                        .on('end', resolve);
                }));


            }
        });
        return Promise.all(tasks);
    });
});


gulp.task('lessMain', function () {
    return gulp.src(build.lessSrc)
        .pipe(gulpIf(!isDev(), order(build.lessSrc)))
        .pipe(concat('index.less'))
        .pipe(less())
        .on('error', shallowError)
        .pipe(autoPrefix())
        .pipe(gulpIf(!isDev(), cleanCss()))
        .pipe(gulp.dest(build.dist))
        .pipe(liveReload());
});
gulp.task('preview', function () {
    return gulp.src(build.previewSrc)
        .pipe(gulpIf(function (e) {
            return e.path.endsWith('.less');
        }, less()))
        .on('error', shallowError)
        .pipe(gulp.dest(build.previewDist));
});
gulp.task('less', ['lessMain', 'preview']);


gulp.task('jadeEntry', function () {
    var originHost = 'localhost';
    var replaceHost = '';
    if (isDev()) {
        try {
            var content = fs.readFileSync(build.localConfigFile).toString();
            var reg = /(?:\d{1,3}\.){3}\d{1,3}/;
            var match = content.match(reg);
            if (match) {
                replaceHost = match[0];
            }
        } catch (e) {
            console.info('no need to replace local url');
        }
    }
    return gulp.src(build.jadeEntrySrc)
        .pipe(gulpIf(isDev(), replace(build.liveReloadCode, build.liveReloadScript)))
        .pipe(jade())
        .on('error', shallowError)
        .pipe(gulpIf(replaceHost.length > 0,
            replace(originHost, replaceHost))
        )
        .pipe(replace('##DICT_URL##', config.dictUrl))
        .pipe(replace('##ASSETS_HOST##', config.assetsHost))
        .pipe(bom())
        .pipe(gulp.dest(build.dist))
        .pipe(liveReload());
});
gulp.task('jadeTemplate', function () {
    // 开发才在这里合并模板，发布环境这里不合并，要等到后续进行文件hash替换后再进行合并
    // 开发环境下不会替换文件hash，所以在这里合并
    return isDev()
        ?
        gulp.src(build.jadeTemplateSrc)
            .pipe(jade())
            .on('error', shallowError)
            .pipe(templateCache('template.js', {
                templateHeader: build.TEMPLATE_HEADER,
            }))
            .pipe(bom())
            .pipe(gulp.dest(build.dist + 'template/'))
            .pipe(liveReload())
        :
        gulp.src(build.jadeTemplateSrc)
            .pipe(jade())
            .on('error', shallowError)
            .pipe(gulp.dest(build.dist + 'html/'));

});
gulp.task('jade', ['jadeEntry', 'jadeTemplate']);


gulp.task('jsLib', function () {
    return gulp.src(filesExist(build.jsLibSrc))
        .pipe(gulpIf(isDev(), sourceMaps.init()))
        .pipe(concat('lib.js'))
        .pipe(gulpIf(isDev(), sourceMaps.write(), uglify()))
        .on('error', function (err) {
            gulpUtil.log(gulpUtil.colors.red('[Error]'), err.toString());
        })
        .pipe(bom())
        .pipe(gulp.dest(build.dist));
});
gulp.task('jsMain', ['lang'], function () {
    var origin = 'window.CF_CONFIG = window.CF_CONFIG || {};';
    var real = 'window.CF_CONFIG = ' + JSON.stringify(config);
    var configStream = gulp.src(build.jsConfigSrc)
        .pipe(replace(origin, real));
    var mainStream = gulp.src(build.jsSrc);
    var entryStream = gulp.src(build.jsEntrySrc);
    return queue({objectMode: true}, configStream, mainStream, entryStream)
        .pipe(gulpIf(!isDev(), ngAnnotate(), sourceMaps.init()))
        .pipe(concat('index.js', {newLine: ';///\n'}))
        .pipe(gulpIf(!isDev(), uglify(), sourceMaps.write()))
        .on('error', function (err) {
            gulpUtil.log(gulpUtil.colors.red('[Error]'), err.toString());
        })
        .pipe(bom())
        .pipe(gulp.dest(build.dist))
        .pipe(liveReload());
});
gulp.task('libUnit', function () {
    var src = filesExist(build.libUnitSrc);
    return isDev()
        ?
        gulp.src(src)
            .pipe(gulp.dest(build.dist + 'lib/'))
        :
        gulp.src(src)
            .pipe(gulpIf(function (e) {
                return e.path.endsWith('.js');
            }, uglify(), cleanCss()))
            .pipe(gulp.dest(build.dist + 'lib/'));
});
gulp.task('js', ['jsLib', 'jsMain', 'libUnit']);


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
gulp.task('ngTemplate', ['imgHash', 'jade'], function () {
    return gulp.src(build.dist + 'html/**/*.html')
        .pipe(templateCache('template.js', {
            templateHeader: build.TEMPLATE_HEADER,
        }))
        .pipe(bom())
        .pipe(gulp.dest(build.dist + 'template/'))
        .on('end', function () {
            // 结束后删除零散的模板文件及目录，
            // 后续任务并不需要等待删除结束才进行
            shell.exec('rm -rf ' + build.dist + 'html');
        });
});
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


gulp.task('uiPreview', function () {
    gulp.src('ui-preview/**/*.less')
        .pipe(concat('index.less'))
        .pipe(less())
        .on('error', shallowError)
        .pipe(autoPrefix())
        .pipe(bom())
        .pipe(gulp.dest('dist/ui-preview/'));
    gulp.src('ui-preview/**/*.jade')
        .pipe(gulpIf(isDev(), replace(build.liveReloadCode, build.liveReloadScript)))
        .pipe(jade())
        .on('error', shallowError)
        .pipe(bom())
        .pipe(gulp.dest('dist/ui-preview/'));
    gulp.src('ui-preview/**/*.js')
        .pipe(sourceMaps.init())
        .pipe(concat('index.js'))
        .pipe(sourceMaps.write())
        .pipe(bom())
        .pipe(gulp.dest('dist/ui-preview/'));
});
gulp.task('uiPreviewLib', function () {
    gulp.src(filesExist('node_modules/prismjs/themes/prism-okaidia.css'))
        .pipe(rename('lib.css'))
        .pipe(bom())
        .pipe(gulp.dest('dist/ui-preview/'));
    return gulp.src(filesExist([
        'node_modules/prismjs/prism.js',
        'node_modules/prismjs/components/prism-markup.js',
        'node_modules/prismjs/components/prism-css.js',
        'node_modules/prismjs/components/prism-clike.js',
        'node_modules/prismjs/components/prism-javascript.js',
        'node_modules/prismjs/components/prism-pug.js',
    ])).pipe(concat('lib.js'))
        .pipe(bom())
        .pipe(gulp.dest('dist/ui-preview/'));
});

gulp.task('clean', function () {
    var distRoot = build.dist.substr(0, build.dist.length - 1);
    return del([build.dist + '**', '!' + distRoot], {force: true});
});


gulp.task('build', function () {
    return new Promise(function (resolve) {
        if (isDev()) {
            runSequence('clean', 'config',
                ['assets', 'less', 'jade', 'js', 'uiPreview', 'uiPreviewLib'], resolve);
        } else {
            runSequence('clean', 'release', resolve);
        }
    });
});

gulp.task('serve', ['build'], function () {
    liveReload.listen();
    watch(build.assetsSrc, function () {
        runSequence('assets');
    });
    watch(build.lessSrc, function () {
        runSequence('less');
    });
    watch(build.jadeTemplateSrc, function () {
        runSequence('jadeTemplate');
    });
    watch(build.jadeEntrySrc, function () {
        runSequence('jadeEntry');
    });
    watch(build.jsEntrySrc.concat(build.jsSrc).concat(build.jsConfigSrc), function () {
        runSequence('jsMain');
    });
    watch(build.previewSrc, function () {
        runSequence('preview');
    });
    watch('lang/code/*.js', function () {
        runSequence('lang');
    });
    watch(build.uiPreviewSrc, function () {
        runSequence('uiPreview');
    });

    var port = yArgs.argv.p || 10003;
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