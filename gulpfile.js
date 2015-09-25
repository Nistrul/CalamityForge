var gulp        = require('gulp');

var jshint      = require('gulp-jshint');

var paths = {
  serverScripts: ['app.js', 'routes/*.js']
};



gulp.task('server', ['lint'], function() {});

gulp.task('lint', function() {
    return gulp.src(paths.serverScripts)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});


gulp.task('watch', function() {
	gulp.watch(paths.serverScripts, ['server']) 
  });

gulp.task('default', ['server'], function() {});

