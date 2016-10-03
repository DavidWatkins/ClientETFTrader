var   gulp = require('gulp')
	, gutil = require('gulp-util')
	, del = require('del')
	, concat = require('gulp-concat')
	, rename = require('gulp-rename')
	, minifycss = require('gulp-minify-css')
	, minifyhtml = require('gulp-minify-html')
	, processhtml = require('gulp-processhtml')
	, jshint = require('gulp-jshint')
	, uglify = require('gulp-uglify')
	, connect = require('gulp-connect')
	, paths;

paths = {
	css:    ['src/css/*.css', 'src/bower_components/modal/stylesheets/jquery.modal.css'],
	libs:   [
		'src/bower_components/angular/angular.min.js',
		'src/bower_components/bootstrap/dist/css/bootstrap.min.css',
		'src/bower_components/bootstrap/dist/js/bootstrap.min.js'
	],
	js:     ['src/js/**/*.js'],
	dist:   './dist/',
	favicon:'src/favicon.ico'
};


//CLEAN
gulp.task('clean', function (cb) {
	del([paths.dist], cb);
});

gulp.task('jshint', function () { 
	return gulp
		  .src(paths.js)
		  .pipe(jshint())
		  .pipe(jshint.reporter('default'));
		  // .pipe(jshint.reporter('fail')); Add this back to prevent build
});

//Copy all bower dependencies
gulp.task('copy-vendor', function () {
	gulp.src(paths.libs)
		.pipe(gulp.dest(paths.dist))
		.on('error', gutil.log);

	gulp.src(paths.favicon)
		.pipe(gulp.dest(paths.dist))
		.on('error', gutil.log);
});

//Shrink down HTML, JS and CSS files
gulp.task('uglify', function () {
	gulp.src(paths.js)
		.pipe(concat('main.min.js'))
		.pipe(gulp.dest(paths.dist))
		.pipe(uglify({outSourceMaps: false}))
		.pipe(gulp.dest(paths.dist));
});
gulp.task('minifycss', function () {
	gulp.src(paths.css)
		.pipe(minifycss({
			keepSpecialComments: false,
			removeEmpty: true
		}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(paths.dist))
		.on('error', gutil.log);
});
gulp.task('minifyhtml', function() {
	gulp.src('dist/index.html')
		.pipe(minifyhtml())
		.pipe(gulp.dest(paths.dist))
		.on('error', gutil.log);
});

//Compile HTML code
gulp.task('processhtml', function() {
	gulp.src('src/index.html')
		.pipe(processhtml({}))
		.pipe(gulp.dest(paths.dist))
		.on('error', gutil.log);
});


//Bring over HTML
gulp.task('html', function(){
	gulp.src(paths.dist)
		.pipe(connect.reload())
		.on('error', gutil.log);
});

gulp.task('build', ['clean', 'jshint', 'copy-vendor', 'uglify', 'minifycss', 'processhtml', 'minifyhtml']);
gulp.task('default', ['build']);
