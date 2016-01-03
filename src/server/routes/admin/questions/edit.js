const express = require('express');
const cwd = require('cwd');
const models = require(cwd('src/server/models'));

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
        return next(new Error(ERR_MSG_NOT_FOUND));
      }

      req.question = question;

      return next();
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
    .then(function() {
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
  models
    .question
    .update({
      text: req.body.text,
      answers: req.body.answers
    }, {
      where: {
        key: req.question.key
      }
    })
    .then(function(question) {
      const promises = [];

      req.body.answers.forEach(function(answer) {
        answer.questionId = question.id;

        promises.push(models.answer.update(
          {
            text: answer.text
          },
          {
            where: {
              id: answer.id
            }
          }
        ));
      });

      return models.Sequelize.Promise.all(promises);
    })
    .then(function() {
      return res.redirect('/questions');
    })
    ;
}
