const express = require('express');
const uuid = require('uuid');
const csrf = require('csurf');
const cwd = require('cwd');
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
    .then(function(c) {
      res.cookie('uuid', c[0].key, {maxAge: fiveYearsFromNow});

      return res
        .render('index', {csrfToken: req.csrfToken()})
        ;
    })
    ;
}

function postQuestion(req, res) {
  return res
    .render('index', {csrfToken: req.csrfToken()})
    ;
}
