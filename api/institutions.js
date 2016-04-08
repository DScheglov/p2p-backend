var models = require('../models/').models;

module.exports = exports = function (ModelAPI) {
  ModelAPI.expose(models.Institution, {
    searchMethod: 'GET',
    expose: {
      "*": true
    }
  })
  return {};
}
