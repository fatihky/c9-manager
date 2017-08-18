var express = require('express');
var bodyParser = require('body-parser');
var argv = require('minimist')(process.argv.slice(2));
var config = require('./config');
var routes = require('./routes');
var IDE = require('./models/ide').db;

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// apply routes
routes(app);

var port = argv.port || config.httpPort;

app.listen(port, '0.0.0.0', function () {
  console.log('Application listening on http://localhost:' + port);
  console.log('Go to the http://localhost:' + port + '/ides to see and manage your ides.');
});
