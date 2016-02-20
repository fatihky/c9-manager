#!/usr/bin/env node
const async = require('async');
const IDE = require('../models/ide').db;
const startIDE = require('../helpers/start-ide');

IDE.find({}, function (err, docs) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  async.seach(docs, function (ide) {
    startIDE(ide._id, function (err, res) {
      console.log('ide:', ide);
      console.log(err, res);
      // ignore errors
      done();
    });
  }, function () {
    console.log('Complete.');
  });
});