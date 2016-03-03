var policies = require('../models/accounting-policies');
var Policy = policies.AccountingPolicy;
var productPolicy = policies.AccountingProductPolicy;

module.exports = exports = function (ModelAPI) {
  ModelAPI.expose(Policy, {
    searchMethod: 'GET'
  });
  ModelAPI.expose(productPolicy, {
    searchMethod: 'GET',
    plural: "ProductPolicies"
  });
  return {};
}
