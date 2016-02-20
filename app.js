var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var config = require('./config');
var routes = require('./routes');
var IDE = require('./models/ide').db;
var portFinder = require('./helpers/port-finder');

portFinder()
  .then(port => {
    console.log('port:', port)
    IDE.find({ port: port }, function (err, docs) {
      console.log(port, err, docs);
    });
  })
  .catch(err => console.log('err:', err));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// apply routes
routes(app);

app.listen(config.httpPort, '0.0.0.0');