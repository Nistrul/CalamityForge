var gulp        = require('gulp');

var jshint      = require('gulp-jshint');

var paths = {
  scripts: ['app.js', 'routes/*.js']
};

// Lint Task
gulp.task('lint', function() {
    return gulp.src(paths.scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('default', ['lint'], function() {

});

