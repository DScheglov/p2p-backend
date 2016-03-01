var institutions = require('../models/institutions');

module.exports = exports = function (ModelAPI) {
  return {
    Institution: new ModelAPI(institutions.Institution, {
      searchMethod: 'GET'
    })
  };
}
