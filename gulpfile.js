var gulp = require('gulp'),
	sass = require('gulp-sass'),
	nano = require('gulp-cssnano'),
	minifyCss = require('gulp-minify-css'),
	cssmin = require('gulp-cssmin'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
	rimraf = require('rimraf'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	sequence = require('run-sequence'),
	pump = require('pump'),
	webserver = require('gulp-webserver');

var paths = {
	vendorJS: [
		'src/lib/coinhive.min.js'
	],
	appJS: [
		'src/js/miner.js'
	]
};

gulp.task('clean', function (cb) {
	rimraf('./app', cb);
});

/* Copy html */
gulp.task('copy:html', function() {
	return gulp.src(['./src/**/*.html']).pipe(gulp.dest('./app'));
});

// Copy vendor js (without concatenating it to some other files)
// has to be changed to work with multiple files
gulp.task('copy:vendorJS', function () {
	return gulp.src(paths.vendorJS)
		.pipe(gulp.dest('./app/lib/'));
});

/* Uglify and copy app JS */
gulp.task('uglify:appJS', function (cb) {
	pump([
			gulp.src('./src/js/*.js'),
			uglify(),
			gulp.dest('./app/js')
		],
		cb
	);
});

/* Compress images */
gulp.task('images', function() {
	return gulp.src('./src/images/*.+(jpg|jpeg|gif|png|svg)')
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest('./src/images/'));
});

/* Copy images */
gulp.task('copy:images', function (cb) {
	// Asset icons
	gulp.src('./src/img/**/*.+(jpg|jpeg|gif|png|svg)')
		.pipe(gulp.dest('./app/img/'))
	;

	cb();
});

/* Compile sass and minify css */
gulp.task('styles', function() {
	/* Compile nested (adding @charset "utf-8") */
	gulp.src('./src/scss/*.scss')
		.pipe(sass({outputStyle: 'nested'})
			.on('error', sass.logError))
		.pipe(gulp.dest('./src/css/'))
	;

	/* Compile compressed (no added charset) */
	return gulp.src('./src/scss/*.scss')
		.pipe(sass({outputStyle: 'compressed'})
			.on('error', sass.logError))
		.pipe(rename({suffix: '.min'}))
		.pipe(cssmin({showLog :true,debug:true}))
		.pipe(gulp.dest('./app/css/'))
	;
});

var cors = function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	next();
};

// Starts a test server, which you can view at http://localhost:8079
gulp.task('webserver', function() {
	gulp.src('./app')
		.pipe(webserver({
			port: 8079,
			host: 'localhost',
			fallback: 'index.html',
			livereload: true,
			open: true,
			middleware: [cors]
		}));
});

// Builds your entire app once, without starting a server
gulp.task('build', function (cb) {
	sequence('clean', ['copy:html', 'copy:vendorJS', 'uglify:appJS', 'styles'], 'copy:images', cb);
});

gulp.task('init', function (cb) {
	sequence('build', 'webserver', cb);
});

// Default task: builds your app, starts a server, and recompiles assets when they change
gulp.task('default', ['init'], function () {
	// Watch Sass
	gulp.watch('./src/scss/**/*.scss', ['styles']);

	// Watch JavaScript
	gulp.watch('./src/js/**/*.js', ['uglify:appJS']);

	// Watch Html
	gulp.watch('./src/**/*.html', ['copy:html']);

	// Watch Images
	gulp.watch('./src/img/**/*.+(jpg|jpeg|gif|png|svg)', ['copy:images']);
});
