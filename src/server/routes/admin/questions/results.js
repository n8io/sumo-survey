'use strict';

const express = require('express');
const cwd = require('cwd');
const models = require(cwd('src/server/models'));

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router.param('id', lookupQuestion);

  router
    .get('/:id/results', setAngularCsrf, getQuestionCreate)
    ;

  app.use('/questions', auth.loginRequired, router);
}

function setAngularCsrf(req, res, next) {
  res.cookie('XSRF-TOKEN', req.csrfToken());

  return next();
}

function getQuestionCreate(req, res) {
  return res.render('admin/questions/results', {question: req.question});
}

function lookupQuestion(req, res, next, id) {
  const reg = /^([0-9a-f]){8}$/ig;
  const ERR_MSG_NOT_FOUND = `Could not find a question with that id.`;
  const isUuid = reg.test(id);

  if (!isUuid) {
    return next(new Error('The given question identifier is in an unknown format'));
  }

  models
    .question
    .findOne({
      where: {
        key: {
          $like: `${id}%`
        }
      }
    })
    .then(function(question) {
      if (!question) {
        return next(new Error(ERR_MSG_NOT_FOUND));
      }

      req.question = question;

      return next();
    })
    ;
}
