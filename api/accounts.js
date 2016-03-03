var accounts = require('../models/accounts');
module.exports = exports = function (ModelAPI) {
  ModelAPI.expose(accounts.Account, {
    searchMethod: 'GET'
  });
  ModelAPI.expose(accounts.AccountFactory, {
    searchMethod: 'GET',
    plural: "AccountFactories",
    exposeStatic: {
      openAccount: "Opens an Account for requested schema"
    }
  });
  return {};
}
