var models = require('../../models/prod-contr/investors-account');

module.exports = exports = function (ModelAPI) {
  var ContractAPI = ModelAPI.expose(models.InvestorAccountContract, {
    searchMethod: 'GET',
    plural: "InvestorAccountContracts",
    expose: {
      refill: true,
      withdraw: true
    },
    exposeStatic: {
      refill: true,
      withdraw: true
    }
  });
  var ProductAPI = ModelAPI.expose(models.InvestorAccountProduct, {
    searchMethod: 'GET',
    plural: "InvestorAccountProducts"
  });
  return {};
}
