var Contract = require('../models/contracts').Contract;

module.exports = exports = function (ModelAPI) {

  ModelAPI.expose(Contract, {
    searchMethod: 'GET'
  })

  return {};
}
