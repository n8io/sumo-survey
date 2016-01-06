'use strict';

const express = require('express');
const cwd = require('cwd');
const _ = require('lodash');

const models = require(cwd('src/server/models'));
const questionController = require(cwd('src/server/controllers/question'));
const answerController = require(cwd('src/server/controllers/answer'));

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router.param('id', lookupQuestion);

  router
    .get('/', getQuestions)
    .get('/:id', getQuestion)
    .post('/', createQuestion)
    .put('/', updateQuestion)
    .delete('/:id', deleteQuestion)
    ;

  app.use('/api/questions', auth.loginRequired, router);
}

function getQuestions(req, res) {
  questionController
    .getAll()
    .then(function(questions) {
      return res.json(questions);
    })
    ;
}

function getQuestion(req, res) {
  questionController
    .get(req.question.id, true)
    .then(function(question) {
      return res.json(question);
    })
    ;
}

function createQuestion(req, res) {
  let question = null;

  questionController
    .create(req.body)
    .then(function(q) {
      const promises = [];

      question = _.assign(q, {});

      (req.body.answers || []).forEach(function(answer) {
        answer.questionId = question.id;

        promises.push(answerController.create(answer));
      });

      return models.Sequelize.Promise.all(promises);
    })
    .then(function() {
      return questionController
        .get(question.id, true)
        .then(function(question) {
          return res.json(question);
        })
        ;
    })
    ;
}

function updateQuestion(req, res) {
  const question = req.body;

  questionController
    .get(question.id, true)
    .then(function(q) {
      const updatingAnswerIds = _.pluck(question.answers, 'id');
      const existingAnswerIds = _.pluck(q.answers, 'id');
      const deletedAnswerIds = _.difference(existingAnswerIds, updatingAnswerIds);

      if (deletedAnswerIds.length) {
        return answerController.destroy(deletedAnswerIds);
      }
      else {
        return 0;
      }
    })
    .then(function() {
      questionController
        .upsert(question)
        .then(function() {
          const promises = [];

          (req.body.answers || []).forEach(function(answer) {
            answer.questionId = question.id;

            promises.push(answerController.upsert(answer));
          });

          return models.Sequelize.Promise.all(promises);
        })
        .then(function(answers) {
          question.answers = answers;

          return res.json(question);
        })
        ;
    })
    ;
}

function deleteQuestion(req, res) {
  questionController
    .destroy(req.question.id)
    .then(function(rowsAffected) {
      return res.json({deletions: rowsAffected});
    })
    ;
}

function lookupQuestion(req, res, next, id) {
  const reg = /^([0-9a-f]){8}$/ig;
  const ERR_MSG = `Could not find a question with that id.`;
  const isUuid = reg.test(id);

  if (!isUuid && !_.isNumber(id)) {
    return next(new Error('The given question identifier is in an unknown format'));
  }

  questionController
    .getByKey(id)
    .then(function(question) {
      if (!question) {
        return next(new Error(ERR_MSG));
      }

      req.question = question;

      return next();
    })
    ;
}
