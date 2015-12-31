const cookieParser = require('cookie-parser');

module.exports = function(app) {
  app.use(cookieParser({
    secret: 'I should be configured elsewhere, but this is a demo',
    httpOnly: true
  }));
};
