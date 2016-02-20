var async = require('async');
var IDE = require('../models/ide').db;
var portFinder = require('../helpers/find-port');

function index(req, res) {
  IDE
    .find()
    .skip(0)
    .limit(10)
    .exec(function (err, data) {
      if (err)
        return res.status(500).send('internal server error');

      res.json(data);
    });
}

function add(req, res) {
  var port = null;

  // validation
  if (typeof req.body.name !== 'string' || req.body.name.length === 0)
    return res.send('name is required.');
  if (typeof req.body.dir !== 'string' || req.body.dir.length === 0)
    return res.send('dir is required.');
  if (typeof req.body.port === 'string' && req.body.port.length > 0) {
    port = parseInt(req.body.port, 10);

    if (isNaN(port) || port < 1000 || port > 65000)
      port = null;
  }

  async.series([
    function findPort(done) {
      if (port !== null)
        return process.nextTick(done);

      portFinder()
        .then(function (port_) {
          port = port_;
          done();
        })
        .catch(done);
    }
  ], function (err) {
    if (err)
      return res.status(500).send('internal server error');

    res.send('port: ' + port);
    // res.redirect('/');
  });
}

module.exports = {
  index: index,
  add: add
};