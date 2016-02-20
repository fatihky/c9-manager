var IDE = require('../models/ide').db;
var net = require('net');
var Promise = require("bluebird");

/**
 * Check port is open or assigned to any ide
 * This helper trys to connect to the specified port and calls cb with
 * true if port is open(other process listening on it) or assigned to any
 * ide. You can bypass database check by setting @param noDBCheck to true
 * By this way, you are trying only connect to the specified port.
 */

/**
 * Check database for ides using @param port
 */

function checkDB(port, cb) {
  IDE.find({ port: port }, function (err, docs) {
    if (err)
      return cb(err);

    // port is not used by any process or ide
    if (docs.length === 0)
      return cb(null, false);

    // this port is used by a ide
    cb(null, true);
  });
}

/**
 * Try connect to the port
 */

function checkGeneral(port, cb, noDBCheck) {
  var socket = new net.Socket();

  socket.connect(port, '127.0.0.1', function (err) {
    socket.end();

    if (err)
      return cb(err, null);

    cb(null, true);
  });

  socket.on('error', function (err) {
    socket.end();

    if (err.code === 'ECONNREFUSED') {
      if (noDBCheck)
        return cb(null, false);

      return checkDB(port, cb);
    }

    cb (err);
  })
}

function check(port, cb, noDBCheck) {
  if (typeof port !== 'number')
    throw new Error('Port must be a number.');

  if (typeof cb === 'function')
    return checkGeneral(port, cb, noDBCheck);

  if (typeof cb === 'boolean')
    noDBCheck = cb;

  return new Promise(function promiseCB(resolve, reject) {
    checkGeneral(port, function (err, res) {
      if (err)
        return reject (err);

      resolve(res);
    }, noDBCheck);
  });
}

module.exports = check;
