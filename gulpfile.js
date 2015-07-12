
// ------------------------------------
// Libraries
// ------------------------------------

var gulp      = require('gulp');
var stylus    = require('gulp-stylus');
var jade      = require('gulp-jade');
var imagemin  = require('gulp-imagemin');
//var svgo      = require('gulp-svgo');

// ------------------------------------
// Paths
// ------------------------------------

var paths     = {
    styles      : './src/assets/styles/**/*.styl',
    stylesCSS   : './src/assets/styles/**/*.css',
    scripts     : './src/assets/scripts/**/*.js',
    images      : './src/assets/images/**/*.{png,gif,jpeg,jpg}',
    svgs        : './src/assets/images/**/*.svg',
    fonts       : './src/assets/fonts/**/*.{eot,svg,ttf,woff,woff2}',
    templates   : './src/**/*.jade'
};

// ------------------------------------
// Default Task
// ------------------------------------

gulp.task('default', ['scripts', 'styles', 'templates', 'images']);

// ------------------------------------
// Watch Task
// ------------------------------------

gulp.task('watch', function() {

    gulp.watch(paths.styles, ['styles']);
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.images, ['images']);
    gulp.watch(paths.templates, ['templates']);

});

// ------------------------------------
// Styles Task
// ------------------------------------

gulp.task('styles', function() {

    gulp.src(paths.styles)
        .pipe(stylus())
        .pipe(gulp.dest('./public/assets/styles/'));

    gulp.src(paths.stylesCSS)
        .pipe(gulp.dest('./public/assets/styles/'));

});

// ------------------------------------
// Scripts Task
// ------------------------------------

gulp.task('scripts', function() {

    gulp.src(paths.scripts)
        .pipe(gulp.dest('./public/assets/scripts/'));

});

// ------------------------------------
// Templates Task
// ------------------------------------

gulp.task('templates', function() {

    gulp.src(paths.templates)
        .pipe(jade({ pretty: true }))
        .pipe(gulp.dest('./public/'));

});

// ------------------------------------
// Images Task
// ------------------------------------

gulp.task('images', function() {

    gulp.src(paths.images)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest('./public/assets/images/'));

    //gulp.src(paths.svgs)
    //    .pipe(svgo())
    //    .pipe(gulp.dest('./public/assets/images/'));

});

// ------------------------------------
// Fonts Task
// ------------------------------------

gulp.task('fonts', function() {

    gulp.src(paths.fonts)
        .pipe(gulp.dest('./public/assets/fonts/'));

});

// ------------------------------------
// Watch Task
// ------------------------------------

gulp.task('watch', function() {

    gulp.watch(paths.styles, ['styles']);
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.images, ['images']);
    gulp.watch(paths.templates, ['templates']);

});

