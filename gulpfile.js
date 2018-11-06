var gulp        = require('gulp');

var plugins =
{
	jshint: require('gulp-jshint'),
	nodemon: require('gulp-nodemon')
};


var server = {
	start: './bin/www',
	scriptPaths: ['main.js', 'routes/*.js', 'src/*.js']
};

let lint = function () {
  return gulp.src(server.scriptPaths)
  .pipe(plugins.jshint())
  .pipe(plugins.jshint.reporter('jshint-stylish'));
}

gulp.task('lint', lint);

gulp.task('server', gulp.series('lint'));

let serverMon = function () {
  return plugins.nodemon({
      watch: server.scriptPaths,
      script: server.start
    });
  }

gulp.task('serverMon', serverMon);

let watch = function() {
	gulp.watch(server.scriptPaths, gulp.series('server')) 
}

gulp.task('watch', watch);

gulp.task('default', gulp.series('server'));

