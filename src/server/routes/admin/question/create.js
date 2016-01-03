const express = require('express');
const cwd = require('cwd');
const models = require(cwd('src/server/models'));

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router.param('id', validateId);

  router
    .all(auth.loginRequired)
    .get('/', setAngularCsrf, getQuestionCreate)
    .post('/', postQuestion)
    ;

  app.use('/admin/question/create', router);
}

function setAngularCsrf(req, res, next) {
  res.cookie('XSRF-TOKEN', req.csrfToken());

  return next();
}

function validateId(req, res, next, id) {
  if (isNaN(id) || parseInt(id, 10) === 0) {
    return next({message: 'Invalid id parameter'});
  }

  req.question = {id: parseInt(id, 10)};

  return next();
}

function getQuestionCreate(req, res) {
  return res
    .status(200)
    .render('admin/question/create', {
      question: req.question,
      csrfToken: req.csrfToken()
    })
    ;
}

function postQuestion(req, res) {
  models
    .question
    .create(req.body)
    .then(function(question) {
      const promises = [];

      req.body.answers.forEach(function(answer) {
        answer.questionId = question.id;

        promises.push(models.answer.create(answer));
      });

      return models.Sequelize.Promise.all(promises);

      // console.log(JSON.stringify(question, null, 2)); // eslint-disable-line no-console
    })
    .then(function() {
      return res.redirect('/admin');
    })
    ;
}
