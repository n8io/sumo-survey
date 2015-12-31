const express = require('express');
const app = express();
const stormpath = require('express-stormpath');

require('dotenv-safe').load();

const logger = require('./helpers/logger')();
const models = require('./models');

const port = process.env.PORT;
const host = process.env.HOST;

app.use(stormpath.init(app, {
  website: true
}));

require('./middleware')(app);
require('./routes')(app, stormpath);

app.on('stormpath.ready', registerModels);

function registerModels() {
  logger.info(`Syncing models with the database mysql:\/\/${process.env.MYSQL_USER}:XXXXX@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}/${process.env.MYSQL_DATABASE}...`);

  models.sequelize.sync().then(startApp);
}

function startApp() {
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
}

