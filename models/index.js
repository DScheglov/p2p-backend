var mongoose    = require('../mongoose');
var log         = require('../lib/logger')(module);

mongoose.connect('mongodb://localhost/p2p');
var db = mongoose.connection;

db.on('error', function (err) {
  log.error('connection error:', err.message);
});
db.once('open', function callback () {
  log.info("Connected to DB!");
});

module.exports = {
  db: db,
  models: require('./models')
};
