var models = require('../models/').models;

module.exports = exports = function (ModelAPI) {
  ModelAPI.expose(models.AccountingProductPolicy, {
    searchMethod: 'GET',
    plural: "ProductPolicies"
  });
  return {};
}
