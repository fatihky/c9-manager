var path = require('path');
var async = require('async');
var swig = require('swig');
var config = require('../config');
var IDE = require('../models/ide').db;
var portFinder = require('../helpers/port-finder');
var portChecker = require('../helpers/port-checker');
var indexTpl = swig.compileFile(
                path.resolve(path.join(__dirname, '../views/ides.html')));

function index(req, res) {
  IDE
    .find()
    .skip(0)
    .limit(10)
    .exec(function (err, data) {
      if (err)
        return res.status(500).send('internal server error');

      var html = indexTpl({
        ides: data,
        baseaddr: config.baseaddr
      });

      res.send(html);
    });
}

function add(req, res) {
  var port = null;
  var checkPort = false;

  // validation
  if (typeof req.body.name !== 'string' || req.body.name.length === 0)
    return res.send('name is required.');
  if (typeof req.body.dir !== 'string' || req.body.dir.length === 0)
    return res.send('dir is required.');
  if (typeof req.body.port === 'string' && req.body.port.length > 0) {
    port = parseInt(req.body.port, 10);

    if (isNaN(port) || port < 1000 || port > 65000)
      port = null;
    else
      checkPort = true;
  }

  async.series([
    function findPort(done) {
      if (checkPort !== false)
        return process.nextTick(done);

      portFinder()
        .then(function (port_) {
          port = port_;
          done();
        })
        .catch(done);
    }, function checkPortAsync(done) {
      if (checkPort !== true)
        return process.nextTick(done);

      portChecker(port).then(isUsed => {
        if (!isUsed)
          return done();

        res.send('port already used by another process or ide');

        done({responseSent: true});
      }).catch(done);
    }, function saveIde(done) {
      IDE.insert({
        name: req.body.name,
        dir: req.body.dir,
        port: port
      }, done);
    }
  ], function (err) {
    if (err)
      return err.responseSent !== true
             ? res.status(500).send('internal server error')
             : null;

    res.redirect('/ides');
  });
}

module.exports = {
  index: index,
  add: add
};