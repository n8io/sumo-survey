const express = require('express');

module.exports = routeHandler;

function routeHandler(app) {
  const router = express.Router();

  router
    .get('/', get)
    ;

  app.use('/', router);
}

function get(req, res) {
  return res
    .render('index')
    ;
}
