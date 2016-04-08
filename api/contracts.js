var models = require('../models').models;

module.exports = exports = function (ModelAPI) {

  ModelAPI.expose(models.Contract, {
    searchMethod: 'GET',
    exposeStatic: {
      "*": true
    }
  })

  return {};
}
