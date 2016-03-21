var entities = require('../models/entities');

module.exports = exports = function (ModelAPI) {

  ModelAPI.expose(entities.PrivateIndividual, {
    searchMethod: 'GET',
    apiName: "PrivateIndividual",
    plural: "PrivateIndividuals"
  });

  ModelAPI.expose(entities.LegalEntity, {
    searchMethod: 'GET',
    apiName: "LegalEntity",
    plural: "LegalEntities"
  });

  return {};
}
