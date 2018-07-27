var gulp = require('gulp');
var concat = require('gulp-concat');
var yArgs = require('yargs');
var gulpIf = require('gulp-if');
var cleanCss = require('gulp-clean-css');
var sourceMaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
//压缩代码
var uglify = require('gulp-uglify');
var bom = require('gulp-bom');
var fileExist = require('files-exist');
var watch = require('gulp-watch');
var runSequence = require('run-sequence');
var del = require('del');
var http = require('http');
var ecstatic = require('ecstatic');
//实时刷新页面
var livereload = require('gulp-livereload');
//定一个dist目录
var distDir = 'dist/';
var cssSrc ='css/*.css';
var cssUnitSrc = 'style/*.css';
var jsSrc = ['js/**/*.js', '!js/controllers/*.js'];
var jsUnitSrc = ['js/controllers/*.js'];
//var jsConfigSrc=['js/config.js','js/app.js','js/main.js','js/config.url.js','js/config.lazyload.js','js/config.router.js'];
var imgSrc = 'assets/images/**/*.*';
var fontSrc = 'assets/fonts/**/*.*';
var htmlSrc = ['src/**/*.html','!src/index.html'];
var indexSrc='src/index.html';
//判断当前运行的是在开发模式还是正式模式
var isProd = function () {
    return yArgs.argv.prod;
};
/**
 * 将所有css文件合成一本bundle.css放到dist目录下面去
 * 如果是发布模式的时候会压缩css
 * gulp.task创建一个任务
 */
gulp.task('bundle-css',function () {
    return gulp.src(cssSrc)
        .pipe(concat('bundle.css'))
        .pipe(gulpIf(isProd(), cleanCss()))
        .pipe(gulp.dest(distDir));
});
//每个controller的css
gulp.task('style-css', function () {
    return gulp.src(cssUnitSrc)
        .pipe(gulpIf(isProd(), cleanCss()))
        .pipe(gulp.dest(distDir+'/style'));
});
/**
 * 将项目自身的业务脚本合成一本bundle.js放到dist目录下去
 * 如果是发布模式的时候会压缩脚本
 * 如果是开发模式下的时候会生成sourceMaps方便调试
 */
//ngAnnotate()压缩，还有就是防止压缩后找不到，为了偷懒
/*sourceMaps.init():初始化，记住现在流里面的代码格式
 * sourceMaps.write():写在bundle.js末尾并加密。在浏览器查看时可看到还原合并前的js,css
 *bom():把他的编码转换为识别中文的，防止中文显示乱码。
 * */
gulp.task('bundle-js', function () {
    return gulp.src(jsSrc)
        .pipe(gulpIf(isProd(),ngAnnotate(),sourceMaps.init()))
        .pipe(concat('bundle.js'))
        .pipe(gulpIf(isProd(), uglify(), sourceMaps.write()))
        .pipe(bom())
        .pipe(gulp.dest(distDir));
});
//每个controller的js
gulp.task('controller-js', function () {
    return gulp.src(jsUnitSrc)
    	.pipe(gulpIf(isProd(),ngAnnotate(),sourceMaps.init()))
    	.pipe(bom())
    	.pipe(gulp.dest(distDir+'/controllers'));
});

/**
 * 将依赖的第三方库脚本合并到一本vendor.js中
 * 如果是发布模式下的时候会压缩脚本
 * jquery放到angular前面
 * fileExist确认列表中的文件是否存在，若不存在则会出错。
 */
gulp.task('vendor-js', function () {
    var vendorList = fileExist([ 
    	'node_modules/jquery/dist/jquery.js',
        'node_modules/bootstrap/dist/js/bootstrap.js',
        'node_modules/angular/angular.js',
        'node_modules/angular-cookies/angular-cookies.js',
        'node_modules/angular-animate/angular-animate.js',
        'node_modules/angular-sanitize/angular-sanitize.js',
        'node_modules/angular-resource/angular-resource.js',
        'node_modules/angular-translate/dist/angular-translate.js',
        'node_modules/angular-translate/dist/angular-translate-storage-local/angular-translate-storage-local.js',
        'node_modules/angular-translate/dist/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
       'node_modules/@uirouter/angularjs/release/angular-ui-router.js',
//     'node_modules/angular-ui-router/release/angular-ui-router.js',
//      'node_modules/angular-ui-router/release/ui-router-angularjs.js',
        'node_modules/oclazyload/dist/ocLazyLoad.js',
        'node_modules/ng-table/bundles/ng-table.js',
        'node_modules/ngstorage/ngStorage.js',
        'node_modules/v-modal/dist/v-modal.js',
        'node_modules/ng-file-upload/dist/ng-file-upload.js',
        'node_modules/angular-ui-load/ui-load.js',
//      'vendor/angular-ui-router/angular-ui-router.js',
        'vendor/angular-ng-SweetAlert/SweetAlert.js',
        
    ]);
    return gulp.src(vendorList)
        .pipe(concat('vendor.js'))
        .pipe(gulpIf(isProd(), uglify()))
        .pipe(bom())
        .pipe(gulp.dest(distDir));
});
gulp.task('vendor-css', function () {
    var vendorList = fileExist([
        'node_modules/bootstrap/dist/css/bootstrap.css',
        'node_modules/v-modal/dist/v-modal.css',
        'node_modules/ng-table/bundles/ng-table.css'
    ]);
    return gulp.src(vendorList)
        .pipe(concat('vendor.css'))
        .pipe(gulpIf(isProd(), cleanCss()))
        .pipe(gulp.dest(distDir));
});
/**
 * 将html模板移动到dist目录下去，保持原有文件夹层次结构
 */
gulp.task('html', function () {
    return gulp.src(htmlSrc)
        .pipe(gulp.dest(distDir));
});
gulp.task('index-html', function () {
    return gulp.src(indexSrc)
        .pipe(gulp.dest(distDir));
});
/**
 * 将图片字体等资源全部转移到dist目录下去，保持原有文件夹层次结构
 */
gulp.task('images', function () {
    return gulp.src(imgSrc)
        .pipe(gulp.dest(distDir+ 'assets/images'));
});
gulp.task('font', function () {
    return gulp.src(fontSrc)
        .pipe(gulp.dest(distDir+ 'assets/fonts'));
});
/*
 * 清除dist目录
 */
gulp.task('clean', function () {
    return del(distDir);
});

/**
 * 构建项目
 * 调用时加上 --prod 参数将会是发布模式
 */
/*
 * runSequence按顺序执行
 * 数组的话是并发执行，
 */
gulp.task('build', function () {
    runSequence('clean', ['bundle-css', 'bundle-js', 'vendor-js', 'vendor-css','html', 'images','font','controller-js','style-css','index-html']);
});
//启动服务器
/*
 * ecstatic请求静态服务器
 * livereload实时刷新
 */
gulp.task('serve', function() {
    var port = yArgs.argv.p || 8000;
    http.createServer(ecstatic({
        root: __dirname + '/dist'
    })).listen(port);
    livereload({start: true});
    console.log('listening on :' + port);
});
/**
 * 默认任务
 * gulp 
 */
gulp.task('default', function () {
    runSequence('build', 'watch', 'serve');
});

/**
 * 监视文件，当文件发生变化时执行对应的构建任务
 */
gulp.task('watch', function () {
	livereload.listen();
    watch(cssSrc, function () {
        runSequence('bundle-css');
    });
    watch(jsSrc, function () {
        runSequence('bundle-js');
    });
    watch(jsSrc, function () {
        runSequence('vendor-js');
    });
    watch(jsUnitSrc, function () {
        runSequence('controller-js');
    });
     watch(cssUnitSrc, function () {
        runSequence('style-css');
    });
    watch(htmlSrc, function () {
        runSequence('html');
    });
    watch(indexSrc, function () {
        runSequence('html');
    });
    watch(imgSrc, function () {
        runSequence('images');
    });
    watch(fontSrc, function () {
        runSequence('font');
    });
});