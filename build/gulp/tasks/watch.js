module.exports = function(gulp, plugins, cfg) {
  gulp.task('watch', watch);

  function watch() {
    plugins.livereload.listen();

    gulp.watch(cfg.js.client.src, ['compile-js']);

    gulp.watch(cfg.css.src, ['compile-css']);
  }
};
