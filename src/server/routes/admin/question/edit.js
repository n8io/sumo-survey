const express = require('express');
const _ = require('lodash');
const cwd = require('cwd');
const models = require(cwd('src/server/models'));

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router
    .get('/:id', setAngularCsrf, getQuestionEdit)
    .post('/:id', postQuestion)
    .delete('/:id', deleteQuestion)
    ;

  app.use('/admin/question', auth.loginRequired, router);
}

function setAngularCsrf(req, res, next) {
  res.cookie('XSRF-TOKEN', req.csrfToken());

  return next();
}

function deleteQuestion(req, res) {

}

function getQuestionEdit(req, res) {
  const whereClause = _.isNumber(req.params.id) ? {id: req.params.id} : {key: req.params.id};

  models
    .question
    .findOne({
      where: whereClause,
      include: [models.answer]
    })
    .then(function(question) {
      return res.render('admin/question/create', {
        question: question
      });
    })
    ;
}

function postQuestion(req, res) {
  models
    .question
    .update({
      text: req.body.text,
      answers: req.body.answers
    }, {
      where: {
        key: req.question.key
      }
    })
    .then(function(question) {
      const promises = [];

      req.body.answers.forEach(function(answer) {
        answer.questionId = question.id;

        promises.push(models.answer.update(
          {
            text: answer.text
          },
          {
            where: {
              id: answer.id
            }
          }
        ));
      });

      return models.Sequelize.Promise.all(promises);
    })
    .then(function() {
      return res.redirect('/admin');
    })
    ;
}
