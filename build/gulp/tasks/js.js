module.exports = function(gulp, plugins, cfg) {
  const localEnv = 'local';

  gulp.task('js', js);

  function js() {
    gulp.src(cfg.js.client.src)
      .pipe(plugins.concat(cfg.js.client.filename)) // Concatenate all files
      .pipe(plugins.if(// Beautify or mangle
        cfg.env === localEnv,
        plugins.beautify(cfg.js.client.beautify),
        plugins.uglify(cfg.js.client.uglify)
      ))
      .pipe(plugins.if(// Strip console.* and debugger statements
        cfg.env !== localEnv,
        plugins.stripDebug()
      ))
      .pipe(plugins.header(cfg.js.client.banner.formatStr, cfg.start)) // Add timestamp to banner
      .pipe(gulp.dest(cfg.js.client.dest))
      .pipe(plugins.if(
        cfg.env === localEnv,
        plugins.livereload()
      ))
      ;
  }
};
