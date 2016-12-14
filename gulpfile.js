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
, mocha = require('gulp-mocha')
, cover = require('gulp-coverage')
, browserSync = require('browser-sync')
, paths;

paths = {
	css:    ['src/css/*.css'],
	html:   ['src/html/*'],
	node:   [
	'server.js',
	'app/**/*.js',
	'config/**/*.js',
	'tests/**/*.js'
	],
	libs:   [
	'./bower_components/angular/angular.min.js',
	'./bower_components/jquery/dist/jquery.min.js',
	'./bower_components/bootstrap/dist/css/bootstrap.min.css',
	'./bower_components/bootstrap/dist/js/bootstrap.min.js',
	'./bower_components/highcharts/highcharts.js',
	'./bower_components/highcharts/js/modules/exporting.js',
	'./bower_components/angular-route/angular-route.min.js',
	'./bower_components/angular-loading-overlay/dist/angular-loading-overlay.js',
	'./bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
	'./bower_components/angular/angular.min.js.map',
	'./bower_components/angular-route/angular-route.min.js.map'
	],
	js:     ['src/js/**/*.js'],
	dist:   './dist/',
	favicon:'src/favicon.ico',
	src: './src/',
	tests: './tests/*.js'
};

//CLEAN
gulp.task('clean', function () {
	return gulp
	.src(paths.dist)
	.pipe(clean({force: true}));
});

//Copy all bower dependencies
gulp.task('bower', function () {
	gulp.src(paths.favicon)
	.pipe(gulp.dest(paths.dist, {overwrite: true}))
	.on('error', gutil.log);

	return gulp.src(paths.libs)
	.pipe(gulp.dest(paths.dist))
	.on('error', gutil.log);
});

//Static files
gulp.task('html', function () {
	return gulp.src(paths.html)
	.pipe(gulp.dest(paths.dist, {overwrite: true}))
	.on('error', gutil.log);
});

gulp.task('js', function () {
	return gulp.src(paths.js)
	.pipe(concat('main.min.js'))
	// .pipe(uglify({outSourceMaps: false}))
	.pipe(gulp.dest(paths.dist, {overwrite: true}));
});

gulp.task('css', function () {
	return gulp.src(paths.css)
	.pipe(minifycss({
		keepSpecialComments: false,
		removeEmpty: true
	}))
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest(paths.dist, {overwrite: true}))
	.on('error', gutil.log);
});

//Static Analysis
gulp.task('jshint', function () { 
	return gulp
	.src(paths.js.concat(paths.node)) //All javascript
	.pipe(jshint())
	.pipe(jshint.reporter('default'));
});

//Test suite
gulp.task('test', function () {
	return gulp.src('tests/**/*.js', { read: false })
	.pipe(cover.instrument({
		pattern: paths.node,
		debugDirectory: 'debug'
	}))
	.pipe(mocha())
	.pipe(cover.gather())
	.pipe(cover.format())
	.pipe(gulp.dest('reports'));
});

gulp.task('build', ['jshint', 'bower', 'html', 'js', 'css']);

gulp.task('develop', function(done) {
	return runSequence('clean', 'build', function() {
		return done();
	});
});

//Live development

// we'd need a slight delay to reload browsers
// connected to browser-sync after restarting nodemon
var BROWSER_SYNC_RELOAD_DELAY = 500;

gulp.task('nodemon', ['develop'], function (cb) {
  gulp.doneCallback = function (err) { };
  var called = false;
  return nodemon({

    // nodemon our expressjs server
    script: 'server.js',

    // watch core server file(s) that require server restart on change
    watch: paths.node
  })
    .on('start', function onStart() {
      // ensure start only got called once
      if (!called) { cb(); }
      called = true;
    })
    .on('restart', function onRestart() {
      // reload connected browsers after a slight delay
      setTimeout(function reload() {
        browserSync.reload({
          stream: false
        });
      }, BROWSER_SYNC_RELOAD_DELAY);
    });
});

gulp.task('browser-sync', ['nodemon'], function () {

  // for more browser-sync config options: http://www.browsersync.io/docs/options/
  browserSync({

    // informs browser-sync to proxy our expressjs app which would run at the following location
    proxy: 'http://localhost:3002',

    // informs browser-sync to use the following port for the proxied app
    // notice that the default port is 3000, which would clash with our expressjs
    port: 4000,

    // open the proxied app in chrome
    browser: ['firefox']
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.doneCallback = function (err) {
	process.exit(err ? 1 : 0);
};

gulp.task('default', ['browser-sync'], function () {
  gulp.watch(paths.js,   ['js', browserSync.reload]);
  gulp.watch(paths.css,  ['css']);
  gulp.watch(paths.html, ['html', 'bs-reload']);
});