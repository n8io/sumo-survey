const cwd = require('cwd');
const models = require(cwd('src/server/models'));

module.exports = {
  get: get,
  getByClientIdAnswerId: getByClientIdAnswerId,
  create: create
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
