var ModelAPI = require('model-api')();

module.exports = exports = function(app) {
  ModelAPI.assign(app, '/api', 'v1');

  require('./entities')(ModelAPI);
  require('./accounts')(ModelAPI);
  require('./institutions')(ModelAPI);
  require('./transactions')(ModelAPI);
  require('./accounting-policies')(ModelAPI);
  require('./products')(ModelAPI);
  require('./contracts')(ModelAPI);
  require('./prod-contr/investors-account')(ModelAPI);

  return ModelAPI;
}
