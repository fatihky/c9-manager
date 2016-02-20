var ides = require('./controllers/ides');

function apply(app) {
  app.get('/ides', ides.index);
  app.post('/ides', ides.add);
}

module.exports = apply;