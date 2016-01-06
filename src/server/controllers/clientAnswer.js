const cwd = require('cwd');
const models = require(cwd('src/server/models'));

module.exports = {
  get: get,
  getByClientIdAnswerId: getByClientIdAnswerId,
  getByAnswerIds: getByAnswerIds,
  create: create,
  destroy: destroy
};

function get(id) {
  return models
    .clientAnswer
    .findOne({
      where: {
        id: id || -1
      }
    })
    ;
}

function getByAnswerIds(answerIds) {
  return models
    .clientAnswer
    .findAll({
      where: {
        answerId: answerIds
      }
    })
    ;
}

function getByClientIdAnswerId(clientId, answerId) {
  return models
    .clientAnswer
    .findOne({
      where: {
        clientId: clientId,
        answerId: answerId
      }
    })
    ;
}

function create(client) {
  return models
    .clientAnswer
    .create(client)
    ;
}

function destroy(id) {
  return models
    .clientAnswer
    .destroy({
      where: {
        id: id || -1
      }
    })
    ;
}
