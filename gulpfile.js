var gulp        = require('gulp');

var plugins =
{
	jshint: require('gulp-jshint'),
	nodemon: require('gulp-nodemon')
};


var server = {
	start: './bin/www',
	scriptPaths: ['app.js', 'routes/*.js', 'src/*.js']
};



gulp.task('server', ['lint'], function() {});

gulp.task('lint', function() {
    return gulp.src(server.scriptPaths)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
});


gulp.task('serverMon', function () {
  return plugins.nodemon({
    watch: server.scriptPaths,
    script: server.start
  });
});

gulp.task('watch', function() {
	gulp.watch(server.scriptPaths, ['server']) 
  });

gulp.task('default', ['server'], function() {});

