module.exports = function(gulp, plugins) {
  const cfg = require('./config');

  // Register all tasks
  require('./tasks')(gulp, plugins, cfg);

  // Expose custom multi-tasks
  gulp.task('compile', plugins.sequence(['compile-js', 'compile-css']));
  gulp.task('compile-js', ['js']);
  gulp.task('compile-css', ['stylus']);
  gulp.task('lint', plugins.sequence(['lint-js', 'lint-css']));
  gulp.task('lint-js', ['eslint']);
  gulp.task('lint-css', ['stylint']);

  gulp.task('default', plugins.sequence(
    [
      'clean',
      'git-info',
      'compile'
      // 'statics',
    ]
  ));

  gulp.task('dev', plugins.sequence(
    [
      'lint',
      'default'
    ],
    'nodemon',
    'watch'
  ));
};
