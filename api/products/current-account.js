var models = require('../../models/').models;

module.exports = exports = function (ModelAPI) {
  var ContractAPI = ModelAPI.expose(models.currentAccountContract, {
    searchMethod: 'GET',
    plural: "CurrentAccountContracts",
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
  var ProductAPI = ModelAPI.expose(models.currentAccountProduct, {
    searchMethod: 'GET',
    plural: "CurrentAccountProducts"
  });
  return {};
}
