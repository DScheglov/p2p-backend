var models = require('../models').models;

module.exports = exports = function (ModelAPI) {
  ModelAPI.expose(models.Account, {
    searchMethod: 'GET'
  });
  ModelAPI.expose(models.AccountFactory, {
    searchMethod: 'GET',
    plural: "AccountFactories",
    exposeStatic: {
      openAccount: "Opens an Account for requested schema"
    }
  });
  return {};
}
