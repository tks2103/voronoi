var gulp    = require('gulp'),
    concat  = require('gulp-concat');

var fileOrder = ['src/geometry.js', 'src/queue.js', 'src/tree.js', 'src/algorithm.js', 'src/renderer.js', 'src/start.js'];

gulp.task('scripts', function() {
  return gulp.src(fileOrder)
         .pipe(concat('main.js'))
         .pipe(gulp.dest('./'));
});
