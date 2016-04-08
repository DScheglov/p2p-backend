var models = require('../models').models;

module.exports = exports = function (ModelAPI) {

  Transaction: ModelAPI.expose(models.Transaction, {
    searchMethod: 'GET',
    expose: {
      "*": true
    }
  })
  return {};
}
