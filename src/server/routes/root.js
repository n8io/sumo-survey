'use strict';

const express = require('express');
const uuid = require('uuid');
const csrf = require('csurf');
const cwd = require('cwd');
const _ = require('lodash');
const models = require(cwd('src/server/models'));
const csrfProtection = csrf({cookie: true});
const fiveYearsFromNow = 1000 * 60 * 60 * 24 * 365 * 5;

module.exports = routeHandler;

function routeHandler(app) {
  const router = express.Router();

  router
    .get('/', getQuestion)
    .post('/', postQuestion)
    ;

  app.use('/', csrfProtection, router);
}

function getQuestion(req, res) {
  let question = null;
  let client = null;

  models
    .client
    .findOrCreate({
      where: {
        key: req.cookies && req.cookies.uuid || 'not set'
      },
      defaults: {
        key: uuid.v4()
      }
    })
    .then(function(objs) {
      client = {key: objs[0].key};
      res.cookie('uuid', client.key, {maxAge: fiveYearsFromNow});

      return models.sequelize.query(`
          SELECT q.id AS questionId
          FROM questions AS q
          WHERE q.id NOT IN (
            SELECT DISTINCT q.id
            FROM questions AS q
              INNER JOIN answers AS a ON q.id = a.questionId
              INNER JOIN clientAnswers AS ca ON a.id = ca.answerId
              INNER JOIN clients AS c ON ca.clientId = c.id
            WHERE c.key = $clientKey
          )
          ORDER BY RAND()
          LIMIT 1
        `, {
          bind: {
            clientKey: client.key
          },
          type: models.sequelize.QueryTypes.SELECT
        }
      );
    })
    .then(function(results) {
      const questionId = results.length ? results[0].questionId : -1;

      return models
        .question
        .findOne({
          where: {
            id: questionId
          },
          order: [['id', 'ASC']]
        })
        ;
    })
    .then(function(q) {
      if (!q) {
        return [];
      }

      question = {
        key: q.key,
        text: q.text
      };

      return q.getAnswers();
    })
    .then(function(answers) {
      if (!question) {
        return res.render('no-question');
      }

      // Slim down the data going across the wire
      answers = _.map(answers, (function(a) {
        return {
          text: a.text,
          key: a.key
        };
      }));

      question = _.omit(_.assign(question, {answers: answers}), ['id']);

      return res
        .render('index', {client: client, question: question, csrfToken: req.csrfToken()})
        ;
    })
    ;
}

function postQuestion(req, res) {
  let question = null;
  let answer = null;
  let client = null;

  // Multiple database calls are not ideal.
  // Most likely leverage a single sproc call here in a live app.
  models
    .question
    .findOne({
      where: {
        key: req.body.q
      }
    })
    .then(function(q) {
      question = q;

      return models
        .answer
        .findOne({
          where: {
            key: req.body.a
          }
        })
        ;
    })
    .then(function(a) {
      answer = a;

      return models
        .client
        .findOne({
          where: {
            key: req.cookies.uuid
          }
        })
        ;
    })
    .then(function(c) {
      client = c;

      if (question && answer && client) {
        models
          .clientAnswer
          .create({
            clientId: client.id,
            answerId: answer.id
          })
          .then(function() {
            return res.render('thank-you');
          })
          ;
      }
      else {
        return res.render('thank-you');
      }
    })
    ;
}
