var ides = require('./controllers/ides');

function apply(app) {
  app.get('/ides', ides.index);
  app.get('/ides/add', ides.addUi);
  app.post('/ides', ides.add);
  app.get('/ides/:id', ides.ide);
  app.get('/ides/start/:id', ides.start);
  app.get('/ides/remove/:id', ides.remove);
}

module.exports = apply;
