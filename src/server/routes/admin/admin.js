const express = require('express');
const cwd = require('cwd');
const models = require(cwd('src/server/models'));

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router.param('id', validateId);

  router
    .get('/', get)
    ;

  app.use('/admin', auth.loginRequired, router);
}

function validateId(req, res, next, id) {
  if (isNaN(id) || parseInt(id, 10) === 0) {
    return next({message: 'Invalid id parameter'});
  }

  req.question = {id: parseInt(id, 10)};

  return next();
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
