const express = require('express');
const cwd = require('cwd');
const models = require(cwd('src/server/models'));

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router
    .get('/', get)
    ;

  app.use('/questions', auth.loginRequired, router);
}

function get(req, res) {
  models
    .question
    .findAll({
      order: [['updatedAt', 'DESC']]
    })
    .then(function(questions) {
      return res.render('admin/index', {questions: questions});
    })
    ;
}
