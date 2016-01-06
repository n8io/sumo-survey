const cwd = require('cwd');
const models = require(cwd('src/server/models'));

module.exports = {
  get: get,
  update: update,
  create: create,
  upsert: upsert,
  destroy: destroy
};

function get(id) {
  return models
    .answer
    .findOne({
      where: {
        $or: [{id: id || -1}, {key: id || 'not set'}]
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

function create(answer) {
  return models
    .answer
    .create(answer)
    ;
}

function upsert(answer) {
  return models
    .answer
    .upsert(
      answer
      , {
        where: {
          id: answer.id || -1
        }
      }
    )
    ;
}

function destroy(id) {
  id = id || 'not set';

  return models
    .answer
    .destroy({
      where: {
        id: id
      }
    })
    ;
}

