const uuid = require('uuid');
const cwd = require('cwd');
const models = require(cwd('src/server/models'));

module.exports = {
  get: get
};

function get(clientKey) {
  return new Promise(function(resolve, reject) {
    return models
      .client
      .findOrCreate({
        where: {
          key: clientKey
        },
        defaults: {
          key: uuid.v4()
        }
      })
      .then(function(objs) {
        if (!objs || !objs.length) {
          return reject('Client not found and could not be created.');
        }

        return resolve({key: objs[0].key});
      })
      ;
  });
}

