var accounts = require('../models/accounts');
module.exports = exports = function (ModelAPI) {
  return {
    Account: new ModelAPI(accounts.Account, {
      searchMethod: 'GET'
    }),
    AccountFactory: new ModelAPI(accounts.AccountFactory, {
      searchMethod: 'GET',
      plural: "AccountFactories",
      exposeStatic: {
        openAccount: "Opens an Account for requested schema"
      }
    })
  };
}
