const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const Promise = require('bluebird');
const running = require('is-running');
const async = require('async');
const mkdirp = require('mkdirp');
const config = require('../config');
const IDE = require('../models/ide').db;
const portChecker = require('../helpers/port-checker');
const pidsdir = path.resolve(path.join(__dirname, '..', 'pids'));
const c9sdkDir = '/opt/c9sdk';
const serverExecutable = '/opt/c9sdk/server.js';

function genPidPath(port) {
  return path.join(pidsdir, port + '.pid');
}

function startIDE(ide, cb) {
  const pidfile = genPidPath(ide.port);
  var pid = 0;
  var live = false; // running(pid)

  // check if pid file exists and process is running
  // if process is running, return error message
  if (fs.existsSync(pidfile)) {
    pid = fs.readFileSync(pidfile).toString();
    pid = parseInt(pid, 10);
    live = running(pid);
    if (live) {
      return process.nextTick(cb.bind(null, null, {
        status: false,
        msg: 'ide is already running'
      }))
    }
  }

  // check port is open
  async.series([
    function createPidsDir(done) {
      mkdirp(pidsdir, done);
    },
    function checkPortAsync(done) {
      portChecker(ide.port, true)
        .then(function (res) {
          // if result is false, port is not opened by any other process
          // just return and continue to next step
          if (res === false)
            return done();

          cb(null, {
            status: false,
            msg: 'another process listening on port'
          });

          done(true);
        })
        .catch(function (err) {
          console.log('Error:', err);
          cb(err);
          done(err);
        });
    },
    function startAsync(done) {
      const user = ide.user !== null
                 ? ide.user
                 : config.defaultUserName;
      const pass = ide.pass !== null
                 ? ide.pass
                 : config.defaultPassword;
      const cmd = spawn('daemonize', [
        // set pid file
        '-p', pidfile,
        // set working directory
        '-c', c9sdkDir,
        // -- end of daemonize options

        serverExecutable,
        // listen on all interfaces
        '-l', '0.0.0.0',
        // set listening port
        '-p', ide.port,
        // set authentication
        '-a', user + ':' + pass,
        // set workspace directory
        '-w', ide.dir
      ]);
      var stdout = '';
      var stderr = '';

      cmd.stdout.on('data', function (data) {
        stdout += data;
      });

      cmd.stderr.on('data', function (data) {
        stderr += data;
      });

      cmd.on('close', function (code) {
        if (code != 0) {
          console.log('exit code:', code);
          console.log('stdout:', stdout);
          console.log('stderr:', stderr);
          return cb(new Error('Process exited with status: ' + code));
        }
        done();
      });
    }
  ], function onComplete(err) {
    if (err)
      return;

    cb(null, {
      status: true,
      msg: 'ide started'
    });
  });
}

function startGeneral(_id, cb) {
  IDE.find({_id: _id}, function (err, docs) {
    if (err)
      return cb(err);
    if (docs.length === 0)
      return cb(null, {
        status: false,
        msg: 'ide not found'
      });

    startIDE(docs[0], cb);
  });
}

function start(_id, cb) {
  if (typeof cb === 'function')
    return startGeneral(_id, cb);

  return new Promise(function (resolve, reject) {
    startGeneral(_id, function (err, res) {
      if (err)
        return reject(err);

      resolve(res);
    });
  })
}

module.exports = start;
