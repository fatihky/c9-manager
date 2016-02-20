var path = require('path');
var async = require('async');
var swig = require('swig');
var config = require('../config');
var IDE = require('../models/ide').db;
var portFinder = require('../helpers/port-finder');
var portChecker = require('../helpers/port-checker');
var startIDE = require('../helpers/start-ide');
var indexTpl = swig.compileFile(
                path.resolve(path.join(__dirname, '../views/ides.html')));
var addTpl = swig.compileFile(
                path.resolve(path.join(__dirname, '../views/ides-add.html')));
var ideTpl = swig.compileFile(
                path.resolve(path.join(__dirname, '../views/ide.html')));

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

function addUi(req, res) {
  res.send(addTpl());
}

function add(req, res) {
  var port = null;
  var checkPort = false;
  var user = null;
  var pass = null;
  var _id = null;

  // validation and input processing
  if (typeof req.body.name !== 'string' || req.body.name.length === 0)
    return res.send('name is required.');
  if (typeof req.body.dir !== 'string' || req.body.dir.length === 0)
    return res.send('dir is required.');
  if (typeof req.body.user === 'string' && req.body.user.length > 0)
    user = req.body.user;
  if (typeof req.body.pass === 'string' && req.body.pass.length > 0)
    pass = req.body.pass;

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
      var obj = {
        name: req.body.name,
        dir: req.body.dir,
        port: port,
        user: user,
        pass: pass
      };

      IDE.insert(obj, function (err, doc) {
        if (err)
          return done(err);

        _id = doc._id;

        done(null);
      });
    }
  ], function (err) {
    if (err)
      return err.responseSent !== true
             ? res.status(500).send('internal server error')
             : null;

    res.redirect('/ides/' + _id);
  });
}

function ide(req, res) {
  IDE.find({_id: req.params.id}, function (err, docs) {
    if (err)
      return res.status(500).send('internal server error');
    if (docs.length === 0)
      return res.status(404).send('ide not found');

    res.send(ideTpl({
      baseaddr: config.baseaddr,
      ide: docs[0]
    }));
  });
}

function start(req, res) {
  startIDE(req.params.id, function (err, result) {
    res.json({
      err: err,
      result: result
    });
  })
}

function remove(req, res) {
  IDE.remove({_id: req.params.id}, function (err, res) {
    res.redirect('/ides');
  });
}

module.exports = {
  index: index,
  addUi: addUi,
  add: add,
  ide: ide,
  start: start,
  remove: remove
};
