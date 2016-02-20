var Promise = require("bluebird");
var config = require('../config');
var check = require('./port-checker');

function findGeneral(port, cb) {
  check(port)
    .then(res => {
      if (res === false)
        return cb(null, port);

      find(port + 1, cb);
    })
    .catch(err => cb (err));
}

function find(port, cb) {
  var startPort = config.startPort;

  if (typeof port === 'number')
    startPort = port;

  if (typeof port === 'function')
    cb = port;

  if (typeof cb === 'function')
    return findGeneral(startPort, cb);

  return new Promise(function promiseCB(resolve, reject) {
    findGeneral(startPort, function (err, res) {
      if (err)
        return reject (err);

      resolve(res);
    });
  });
}

module.exports = find;
