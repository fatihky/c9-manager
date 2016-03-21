var Promise = require("bluebird");
var config = require('../config');
var check = require('./port-checker');

/**
 * Find first available port
 */

// internal function that checks port with port checker helper
// and recursively calls find function until find avaliable port
function findGeneral(port, cb) {
  check(port)
    .then(function (res) {
      if (res === false)
        return cb(null, port);

      find(port + 1, cb);
    })
    .catch(function (err) {
      cb (err)
    });
}

/**
 * Find first available port after @param port.
 * @param {number} [port=config.startPort] Start port
 * @param {function=} cb Callback function. If not set, this function
 *  returns a Promise
 * @returns {undefined|Promise} If cb is set, returns undefined,
 *  otherwise returns a Promise.
 */

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
