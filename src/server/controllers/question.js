'use strict';

const cwd = require('cwd');
const models = require(cwd('src/server/models'));

module.exports = {
  get: get,
  getByKey: getByKey,
  getAll: getAll,
  getRandom: getRandom,
  update: update,
  destroy: destroy
};

function getRandom(clientKey) {
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
        clientKey: clientKey
      },
      type: models.sequelize.QueryTypes.SELECT
    }
  );
}

function get(id, includeAnswers) {
  let opts = {};

  id = id || 'not set';

  opts = {
    where: {
      $or: [{id: id}, {key: id}]
    },
    order: [['id', 'ASC']]
  };

  if (includeAnswers) {
    opts.include = [models.answer];
  }

  return models
    .question
    .findOne(opts)
    ;
}

function getByKey(key) {
  key = key || 'not set';

  return models
    .question
    .findOne({
      where: {
        key: {
          $like: `${key}%`
        }
      },
      include: [models.answer]
    })
    ;
}

function getAll() {
  return models
    .question
    .findAll({
      order: [['updatedAt', 'DESC']]
    })
    ;
}

function destroy(id) {
  id = id || 'not set';

  return models
    .question
    .findOne({
      where: {
        $or: [{id: id}, {key: id}]
      },
      order: [['id', 'ASC']]
    })
    ;
}

function update(question, key) {
  key = key || 'not set';

  return models
    .question
    .update(question, {
      where: {
        key: key
      }
    })
    ;
}
