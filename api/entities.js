var entities = require('../models/entities');

module.exports = exports = function (ModelAPI) {

  ModelAPI.expose(entities.privateIndividual, {
    searchMethod: 'GET',
    apiName: "PrivateIndividual",
    plural: "PrivateIndividuals"
  });

  ModelAPI.expose(entities.legalEntity, {
    searchMethod: 'GET',
    apiName: "LegalEntity",
    plural: "LegalEntities"
  });

  return {};
}
