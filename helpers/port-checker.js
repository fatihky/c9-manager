var IDE = require('../models/ide').db;
var net = require('net');
var Promise = require("bluebird");

function checkDB(port, cb) {
  IDE.find({ port: port }, function (err, docs) {
    if (err)
      return cb(err);

    // port is not used by any process or ide
    if (docs.length === 0)
      return cb(null, false);

    check(port + 1, cb);
  });
}

function checkGeneral(port, cb) {
  var socket = new net.Socket();

  socket.connect(port, '127.0.0.1', function (err) {
    socket.end();

    if (err)
      return cb(err, null);

    cb(null, true);
  });

  socket.on('error', function (err) {
    socket.end();

    if (err.code === 'ECONNREFUSED')
      return checkDB(port, cb);

    cb (err);
  })
}

function check(port, cb) {
  if (typeof port !== 'number')
    throw new Error('Port must be a number.');

  if (typeof cb === 'function')
    return checkGeneral(cb);

  return new Promise(function promiseCB(resolve, reject) {
    checkGeneral(port, function (err, res) {
      if (err)
        return reject (err);

      resolve(res);
    });
  });
}

module.exports = check;
