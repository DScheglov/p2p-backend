var models = require('../models').models;

module.exports = exports = function (ModelAPI) {

  ModelAPI.expose(models.PrivateIndividual, {
    searchMethod: 'GET',
    apiName: "PrivateIndividual",
    plural: "PrivateIndividuals"
  });

  ModelAPI.expose(models.LegalEntity, {
    searchMethod: 'GET',
    apiName: "LegalEntity",
    plural: "LegalEntities"
  });

  return {};
}
