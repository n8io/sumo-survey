const express = require('express');
const cwd = require('cwd');
const chalk = require('chalk');
const models = require(cwd('src/server/models'));
const questionController = require(cwd('src/server/controllers/question'));
const answerController = require(cwd('src/server/controllers/answer'));

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router.param('id', lookupQuestion);

  router
    .get('/:id', setAngularCsrf, getQuestionEdit)
    .post('/:id', postQuestion)
    .delete('/:id', deleteQuestion)
    ;

  app.use('/questions', auth.loginRequired, router);
}

function setAngularCsrf(req, res, next) {
  res.cookie('XSRF-TOKEN', req.csrfToken());

  return next();
}

function lookupQuestion(req, res, next, id) {
  const reg = /^([0-9a-f]){8}$/ig;
  const ERR_MSG_NOT_FOUND = `Could not find a question with that id.`;
  const isUuid = reg.test(id);

  if (!isUuid) {
    return next(new Error('The given question identifier is in an unknown format'));
  }

  questionController
    .getByKey(id)
    .then(function(question) {
      if (!question) {
        return next(new Error(ERR_MSG_NOT_FOUND));
      }

      req.question = question;

      return next();
    })
    ;
}

function deleteQuestion(req, res) {
  questionController
    .delete(req.question.id)
    .then(function(/* rowsAffected */) {
      return res.redirect('/questions');
    })
    .catch(function(reason) {
      // TODO: handle failures better

      console.log(chalk.red(`Failed to delete question.\n${reason}`)); // eslint-disable-line no-console

      return res.redirect('/questions');
    })
    ;
}

function getQuestionEdit(req, res) {
  return res.render('admin/questions/edit', {
    question: req.question
  });
}

function postQuestion(req, res) {
  questionController
    .update({
      text: req.body.text,
      answers: req.body.answers
    })
    .then(function(question) {
      const promises = [];

      req.body.answers.forEach(function(answer) {
        answer.questionId = question.id;

        promises.push(answerController.update({
          text: answer.text
        }));
      });

      return models.Sequelize.Promise.all(promises);
    })
    .then(function() {
      return res.redirect('/questions');
    })
    .catch(function(reason) {
      // TODO: handle failures better

      console.log(chalk.red(`Failed to update question.\n${reason}`)); // eslint-disable-line no-console

      return res.redirect('/questions');
    })
    ;
}
