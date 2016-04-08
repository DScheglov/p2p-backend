var models = require('../models/').models;

module.exports = exports = function (ModelAPI) {
  ModelAPI.expose(models.Product, {
    searchMethod: 'GET'
  });
  return {};
}
