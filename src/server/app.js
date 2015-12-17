const express = require('express');
const app = express();

require('dotenv-safe').load();

const logger = require('./helpers/logger')();

const port = process.env.PORT;
const host = process.env.HOST;

require('./middleware')(app);
require('./routes')(app);

const server = app.listen(port, host, function() {
  const actualHost = server.address().address;
  const actualPort = server.address().port;

  logger.info('%s@%s listening at http://%s:%s on Node', // eslint-disable-line
    process.env.npm_package_name,
    process.env.npm_package_version,
    actualHost,
    actualPort,
    process.version
  );
});

module.exports = server;
