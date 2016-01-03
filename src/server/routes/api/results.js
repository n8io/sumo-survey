'use strict';

const express = require('express');
const cwd = require('cwd');
const _ = require('lodash');
const models = require(cwd('src/server/models'));

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
  models
    .question
    .destroy({
      where: {
        id: req.clientAnswer.id
      }
    })
    .then(function(rowsAffected) {
      return res.json({deletions: rowsAffected});
    })
    ;
}

function lookupClientAnswer(req, res, next, clientAnswerId) {
  if (parseInt(clientAnswerId, 10) === 0) {
    return next(new Error('The given client answer id is in an unknown format'));
  }

  models
    .clientAnswer
    .findOne({
      where: {
        id: req.params.clientAnswerId
      }
    })
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
  const ERR_MSG = `Could not find a question with that id.`;
  const isUuid = reg.test(id);

  if (!isUuid && !_.isNumber(id)) {
    return next(new Error('The given question identifier is in an unknown format'));
  }

  console.log('here'); // eslint-disable-line no-console

  if (isUuid) {
    models
      .question
      .findOne({
        where: {
          key: {
            $like: `${id}%`
          }
        },
        include: [
          models.answer
        ]
      })
      .then(function(question) {
        if (!question) {
          return next(new Error(ERR_MSG));
        }

        req.question = question;

        models
          .clientAnswer
          .findAll({
            where: {
              answerId: _.pick(question.answers, 'id')
            }
          })
          .then(function() {
            // TODO: finish counts stuff
          })
          ;

        return next();
      })
      ;
  }
  else if (_.isNumber(id)) {
    models
      .question
      .findOne({
        where: {
          id: parseInt(id, 10)
        },
        include: [
          models.answer
        ]
      })
      .then(function(question) {
        if (!question) {
          return next(new Error(ERR_MSG));
        }

        req.question = question;

        return next();
      })
      ;
  }
}
