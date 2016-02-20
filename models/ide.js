var path = require('path');
var Datastore = require('nedb');
var db = new Datastore(path.resolve(path.join(__dirname, '../data/ides.nedb')));

db.loadDatabase();

module.exports = {
  db: db
};
