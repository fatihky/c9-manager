var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var config = require('./config');
var routes = require('./routes');
var IDE = require('./models/ide').db;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// apply routes
routes(app);

app.listen(config.httpPort, '0.0.0.0', function () {
  console.log('Application listening on http://localhost:' + config.httpPort);
  console.log('Go to the http://localhost:' + config.httpPort + '/ides to see and manage your ides.');
});
