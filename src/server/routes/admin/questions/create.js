const express = require('express');

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router
    .get('/', setAngularCsrf, getQuestionCreate)
    ;

  app.use('/questions/new', auth.loginRequired, router);
}

function setAngularCsrf(req, res, next) {
  res.cookie('XSRF-TOKEN', req.csrfToken());

  return next();
}

function getQuestionCreate(req, res) {
  return res.render('admin/questions/edit');
}
