'use strict';

const express = require('express');
const cwd = require('cwd');
const _ = require('lodash');

const models = require(cwd('src/server/models'));
const questionController = require(cwd('src/server/controllers/question'));

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

  models
    .question
    .create(req.body)
    .then(function(q) {
      const promises = [];

      question = _.assign(q, {});

      (req.body.answers || []).forEach(function(answer) {
        answer.questionId = question.id;

        promises.push(models.answer.create(answer));
      });

      return models.Sequelize.Promise.all(promises);
    })
    .then(function() {
      models
        .question
        .findOne({
          where: {
            id: question.id
          },
          include: [models.answer]
        })
        .then(function(question) {
          return res.json(question);
        })
        ;
    })
    ;
}

function updateQuestion(req, res) {
  const question = req.body;

  models
    .question
    .findOne({
      where: {
        id: question.id
      },
      include: [models.answer]
    })
    .then(function(q) {
      const updatingAnswerIds = _.pluck(question.answers, 'id');
      const existingAnswerIds = _.pluck(q.answers, 'id');
      const deletedAnswerIds = _.difference(existingAnswerIds, updatingAnswerIds);

      if (deletedAnswerIds.length) {
        return models
          .answer
          .destroy({
            where: {
              id: deletedAnswerIds
            }
          })
          ;
      }
      else {
        return 0;
      }
    })
    .then(function() {
      models
        .question
        .upsert(
          question
          , {
            where: {
              id: question.id || -1
            }
          }
        )
        .then(function() {
          const promises = [];

          (req.body.answers || []).forEach(function(answer) {
            answer.questionId = question.id;

            promises.push(models.answer.upsert(answer, {where: {id: answer.id}}));
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
  models
    .question
    .destroy({
      where: {
        id: req.question.id
      }
    })
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

  if (isUuid) {
    models
      .question
      .findOne({
        where: {
          key: {
            $like: `${id}%`
          }
        },
        include: [models.answer]
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
  else if (_.isNumber(id)) {
    models
      .question
      .findOne({
        where: {
          id: parseInt(id, 10)
        },
        include: [models.answer]
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
