const cwd = require('cwd');
const models = require(cwd('src/server/models'));

module.exports = {
  get: get,
  update: update
};

function get(id) {
  return models
    .answer
    .findOne({
      where: {
        id: id || -1
      }
    })
    ;
}

function update(answer) {
  return models
    .answer
    .findOne(answer, {
      where: {
        id: answer.id
      }
    })
    ;
}

