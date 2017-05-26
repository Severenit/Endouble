'use strict';
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const jade = require('gulp-jade');
const minifyCss = require('gulp-minify-css');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const watch = require('gulp-watch');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const nodemon = require('gulp-nodemon');
const gulpSequence = require('gulp-sequence')

const path = {
    app: './app',
    dev: './builds/dev'
}
const libsArray = [
    './node_modules/jquery/dist/jquery.js'
];

gulp.task('js', function () {
    return browserify({entries: path.app +'/js/main.js', debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest(path.dev));
});

gulp.task('libsjs', function () {
    gulp.src(libsArray)
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('builds/dev'));
});

gulp.task('html', function () {
    gulp.src(path.app + '/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(path.dev));
});

gulp.task('img', function () {
    gulp.src(path.app + '/img/**/*.*')
        .pipe(gulp.dest(path.dev + '/img/'));
});

gulp.task('assets', function () {
    gulp.src(path.app + '/assets/**/*.*')
        .pipe(gulp.dest(path.dev + '/assets/'));
});

gulp.task('scss', function ( done ) {
    gulp.src(path.app + '/scss/**/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest(path.dev + '/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest(path.dev + '/css/'))
        .on('end', done);
});

gulp.task('watch', function () {
    watch(path.app + '/scss/**/*.scss', function () {
        gulp.start('scss')
    });
    watch(path.app + '/**/*.js', function () {
        gulp.start('js')
    });
    watch(path.app + '/**/*.jade', function () {
        gulp.start('html')
    });
    watch(path.app + '/img/**/*.*', function () {
        gulp.start('img')
    });
    watch(path.app + '/assets/**/*.*', function () {
        gulp.start('assets')
    });
});

gulp.task('webserver', function () {
    nodemon({
        script: 'server.js'
    })
});

gulp.task('default', gulpSequence(
    'js',
    'libsjs',
    'scss',
    'img',
    'html',
    'watch',
    'assets',
    'webserver'
));

