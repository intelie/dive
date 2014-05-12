var gulp = require('gulp');
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');

var plumber = require('gulp-plumber');
var watching = false;

var sources = ['src/core.js', 'src/**/*.js'];

gulp.task('test', shell.task([
  'cd test && lein cleantest'
]));

gulp.task('dev', function() {
  return gulp.src(sources)
    .pipe(concat('dive.js'))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('test/js'));
});

gulp.task('build', function() {
  return gulp.src(sources)
    .pipe(concat('dive.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('cleantest', function() {
  gulp.start('dev');
  gulp.start('test');
});
