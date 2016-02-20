var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var routes = require('./routes');

var portFinder = require('./helpers/find-port');

portFinder()
  .then(port => console.log('port:', port))
  .catch(err => console.log('err:', err));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// apply routes
routes(app);

app.listen(4715, '0.0.0.0');