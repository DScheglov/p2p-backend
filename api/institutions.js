var institutions = require('../models/institutions');

module.exports = exports = function (ModelAPI) {
  ModelAPI.expose(institutions.Institution, {
    searchMethod: 'GET',
    expose: {
      "*": true
    }
  })
  return {};
}
