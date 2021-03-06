'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    dialectOptions: {
      timeout: 3 * 1000
    },
    logging: process.env.BUNYAN_LOG_LEVEL === 'debug' ? console.log : function() {} // eslint-disable-line no-console
  }
);
const db = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js' && file !== '_associations.js');
  })
  .forEach(function(file) {
    const model = sequelize.import(path.join(__dirname, file));

    db[model.name] = model;
  });

// Object.keys(db).forEach(function(modelName) {
//   if ('associate' in db[modelName]) {
//     db[modelName].associate(db);
//   }
// });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

require('./_associations')(db);

module.exports = db;
