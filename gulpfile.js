var autoprefix = require('gulp-autoprefixer');
var browserify = require('browserify');
var concat = require('gulp-concat');
var del = require('del');
var gulp = require('gulp');
var less = require('gulp-less');
var reactify = require('reactify');
var size = require('gulp-size');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var webserver = require('gulp-webserver');

gulp.task('clean', function(cb) {
  del(['build'], cb);
});

gulp.task('css', [], function() {
  return gulp.src('./style/*.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .on('error', swallowError)
    .pipe(autoprefix())
    .pipe(concat('app.css'))
    .pipe(size())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build'));
});

gulp.task('js', [], function() {
  browserify({
    debug: true,
    insertGlobals: true,
    entries: ['./App.js']
  })
  .transform(function(file) { return reactify(file, {es6: true}); })
  .bundle({debug: true})
  .on('error', swallowError)
  .pipe(source('app.js'))
  .pipe(gulp.dest('build'));
});

gulp.task('watch', ['build'], function () {
  gulp.watch('./*.js', ['js']);
  gulp.watch('./style/*.less', ['css']);
});

gulp.task('webserver', function() {
  gulp.src('.')
    .pipe(webserver({
      fallback: 'index.html'
    }));
});

gulp.task('build', ['css', 'js']);

gulp.task('default', ['watch', 'webserver']);

function swallowError(error) {
  console.log(error.toString());
  this.emit('end');
}
