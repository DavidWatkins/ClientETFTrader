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
	, nodemon = require('gulp-nodemon')
	, clean = require('gulp-clean')
	, runSequence = require('run-sequence')
	, jasmine = require('gulp-jasmine')
	, paths;

paths = {
	css:    ['src/css/*.css'],
	assets: ['src/assets/*'],
	html:   ['src/html/*'],
	libs:   [
		'bower_components/angular/angular.min.js',
		'bower_components/jquery/dist/jquery.min.js',
		'bower_components/bootstrap/dist/css/bootstrap.min.css',
		'bower_components/bootstrap/dist/js/bootstrap.min.js',
		'bower_components/highcharts/highcharts.js',
		'bower_components/highcharts/js/modules/exporting.js',
		'bower_components/angular-route/angular-route.min.js',
		'bower_components/angular-loading-overlay/dist/angular-loading-overlay.js',
		'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
		'bower_components/angular/angular.min.js.map',
		'bower_components/angular-route/angular-route.min.js.map'
	],
	js:     ['src/js/**/*.js'],
	dist:   './dist/',
	favicon:'src/favicon.ico',
	src: './src/',
	tests: './tests/*.js'
};


//CLEAN
gulp.task('clean', function () {
	return gulp.src(paths.dist, {read: false})
        .pipe(clean({force: true}));
});


gulp.task('jshint-web', function () { 
	return gulp
		  .src(paths.js)
		  .pipe(jshint())
		  .pipe(jshint.reporter('default'));
		  // .pipe(jshint.reporter('fail')); Add this back to prevent build
});

gulp.task('jshint-node', function () {
	return gulp
			.src('server.js')
			.pipe(jshint())
			.pipe(jshint.reporter('default'));
});

//test suite
gulp.task('test', function () {
	return gulp
		.src(paths.tests)
		.pipe(jasmine());
});

//Copy all bower dependencies
gulp.task('copy-vendor', function () {
	gulp.src(paths.libs)
		.pipe(gulp.dest(paths.dist, {overwrite: true}))
		.on('error', gutil.log);

	return gulp.src(paths.favicon)
		.pipe(gulp.dest(paths.dist, {overwrite: true}))
		.on('error', gutil.log);
});

gulp.task('copy-assets', function () {
	return gulp.src(paths.assets)
		.pipe(gulp.dest(paths.dist, {overwrite: true}))
		.on('error', gutil.log);
});

gulp.task('copy-html', function () {
	return gulp.src(paths.html)
		.pipe(gulp.dest(paths.dist, {overwrite: true}))
		.on('error', gutil.log);
});

//Shrink down HTML, JS and CSS files
gulp.task('uglify', function () {
	return gulp.src(paths.js)
		.pipe(concat('main.min.js'))
		// .pipe(uglify({outSourceMaps: false}))
		.pipe(gulp.dest(paths.dist, {overwrite: true}));
});
gulp.task('minifycss', function () {
	return gulp.src(paths.css)
		.pipe(minifycss({
			keepSpecialComments: false,
			removeEmpty: true
		}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(paths.dist, {overwrite: true}))
		.on('error', gutil.log);
});

gulp.task('build', ['jshint-web', 'jshint-node', 'copy-vendor', 'copy-assets', 'copy-html', 'uglify', 'minifycss']);

gulp.task('develop', function(done) {
    return runSequence('clean', 'build', function() {
        return done();
    });
});

gulp.task('nodemon', ['develop'], function () {
  var stream = nodemon({ script: 'server.js'
          , ext: 'html js css'
          , ignore: [paths.dist + '*']
          , watch: [paths.src]
          , tasks: ['develop'] });
 
  return stream
      .on('restart', function () {
         console.log('restarted!')
      })
      .on('crash', function() {
         console.error('Application has crashed!\n');
         stream.emit('restart', 10) ; // restart the server in 10 seconds
      })
});

gulp.task('default', ['build']);