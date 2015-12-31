const os = require('os');

const controller = {
  upsert: upsert
};

module.exports = controller;

function upsert(text, id) {
  return {
    message: 'OK',
    hostname: os.hostname()
  };
}
