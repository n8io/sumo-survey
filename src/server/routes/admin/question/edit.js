const express = require('express');
const cwd = require('cwd');
const models = require(cwd('src/server/models'));

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router.param('id', validateId);

  router
    .get('/:id', getQuestionEdit)
    .post('/:id', postQuestion)
    ;

  app.use('/admin/question/edit', auth.loginRequired, router);
}

function validateId(req, res, next, id) {
  if (isNaN(id) || parseInt(id, 10) === 0) {
    return next({message: 'Invalid id parameter'});
  }

  req.question = {id: parseInt(id, 10)};

  return next();
}

function getQuestionEdit(req, res) {
  models
    .question
    .findOne({
      where: {
        id: req.question.id
      }
    })
    .then(function(question) {
      return res.render('admin/question/create', {
        question: question,
        csrfToken: req.csrfToken()
      });
    })
    ;
}

function postQuestion(req, res) {
  models
    .question
    .update({
      text: req.body.question
    }, {
      where: {
        id: req.question.id
      }
    })
    .then(function() {
      return res.redirect('/admin');
    })
    ;
}
