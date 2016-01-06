'use strict';

const express = require('express');
const csrf = require('csurf');
const chalk = require('chalk');
const cwd = require('cwd');
const _ = require('lodash');
const clientController = require(cwd('src/server/controllers/client'));
const questionController = require(cwd('src/server/controllers/question'));
const answerController = require(cwd('src/server/controllers/answer'));
const clientAnswerController = require(cwd('src/server/controllers/clientAnswer'));
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
  const clientKey = req.cookies && req.cookies.uuid || 'not set';
  let question = null;
  let client = null;

  clientController
    .get(clientKey)
    .then(function(c) {
      client = c;

      // Write cookie for unique client
      res.cookie('uuid', client.key, {maxAge: fiveYearsFromNow});

      return questionController.getRandom(c.key);
    })
    .then(function(customQueryResults) {
      const questionId = customQueryResults.length ? customQueryResults[0].questionId : -1;

      return questionController.get(questionId);
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
    .catch(function(reason) {
      // TODO: handle failures better

      console.log(chalk.red(`Failed to query for a question.\n${reason}`)); // eslint-disable-line no-console
    })
    ;
}

function postQuestion(req, res) {
  let question = null;
  let answer = null;
  let client = null;

  // Multiple database calls are not ideal.
  // Most likely leverage a single sproc call here in a live app.
  questionController
    .getQuestion(req.body.q)
    .then(function(q) {
      question = q;

      return answerController.get(req.body.a);
    })
    .then(function(a) {
      answer = a;

      return clientController.get(req.cookies.uuid);
    })
    .then(function(c) {
      client = c;

      if (question && answer && client) {
        clientAnswerController
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
        // TODO: handle failure case

        return res.render('thank-you');
      }
    })
    .catch(function(reason) {
      // TODO: handle failures better

      console.log(chalk.red(`Failed to save client answer.\n${reason}`)); // eslint-disable-line no-console

      return res.render('thank-you');
    })
    ;
}
