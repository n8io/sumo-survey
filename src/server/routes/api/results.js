'use strict';

const express = require('express');
const cwd = require('cwd');
const _ = require('lodash');
const clientAnswerController = require(cwd('src/server/controllers/clientAnswer'));
const questionController = require(cwd('src/server/controllers/question'));

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router.param('id', lookupQuestion);
  router.param('clientAnswerId', lookupClientAnswer);

  router
    .get('/:id/results', getResults)
    .delete('/:id/results/:clientAnswerId', deleteClientAnswer)
    ;

  app.use('/api/questions', auth.loginRequired, router);
}

function getResults(req, res) {
  return res.json(req.question);
}

function deleteClientAnswer(req, res) {
  clientAnswerController
    .destroy(req.clientAnswer.id)
    .then(function(rowsAffected) {
      return res.json({deletions: rowsAffected});
    })
    ;
}

function lookupClientAnswer(req, res, next, clientAnswerId) {
  if (parseInt(clientAnswerId, 10) === 0) {
    return next(new Error('The given client answer id is in an unknown format'));
  }

  clientAnswerController
    .get(req.params.clientAnswerId)
    .then(function(clientAnswer) {
      if (!clientAnswer) {
        return next(new Error('The given client answer could not be found.'));
      }

      req.clientAnswer = clientAnswer;

      return next();
    })
    ;
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

      clientAnswerController
        .getByAnswerIds(_.pluck(question.answers, 'id'))
        .then(function(clientAnswers) {
          const answersWithResults = _.map(unbind(req.question.answers), function(a) {
            a.results = _.where(clientAnswers, {answerId: a.id});

            return a;
          })
          ;

          req.question = _.assign(unbind(req.question), {answers: answersWithResults});

          return next();
        })
        ;
    })
    ;
}

function unbind(obj) {
  return JSON.parse(JSON.stringify(obj));
}
