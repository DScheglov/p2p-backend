var Policy = require('../models/accounting-policies').AccountingPolicy;

module.exports = exports = function (ModelAPI) {
  return {
    Policy: new ModelAPI(Policy, {
      searchMethod: 'GET'
    })
  };
}
