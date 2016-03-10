var models = require('../../models/investors-account');

module.exports = exports = function (ModelAPI) {
  var ContractAPI = ModelAPI.expose(models.Contract, {
    searchMethod: 'GET',
    plural: "InvestorAccountContracts",
    expose: {
      refill: true,
      withdraw: true,
      accrueInterests: true,
      payoutInterests: true
    },
    exposeStatic: {
      refill: true,
      withdraw: true
    },
    listPopulate: "accounts.currrent",
    populate: "accounts.current accounts.interests"
  });
  var ProductAPI = ModelAPI.expose(models.Product, {
    searchMethod: 'GET',
    plural: "InvestorAccountProducts"
  });
  return {};
}
