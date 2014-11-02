var gulp    = require('gulp'),
    concat  = require('gulp-concat'),
    connect = require('gulp-connect'),
    watch   = require('gulp-watch');


var fileOrder = ['src/geometry.js', 'src/queue.js', 'src/tree.js', 'src/algorithm.js', 'src/renderer.js', 'src/main.js'];

gulp.task('scripts', function () {
  return gulp.src(fileOrder)
         .pipe(concat('main.js'))
         .pipe(gulp.dest('./'))
         .pipe(connect.reload());
});

gulp.task('connect', function () {
  connect.server({
    root: __dirname + '/',
    port: 9000,
    livereload: {
      port: 35729
    }
  })
});

gulp.task('watch', ['connect'], function() {
  gulp.watch(fileOrder, connect.reload);
  gulp.watch(fileOrder, ['scripts']);
});

gulp.task('build', ['scripts', 'connect', 'watch']);
