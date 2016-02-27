var entities = require('../models/entities');

module.exports = exports = function (ModelAPI) {
	return {
		privateIndividual: new ModelAPI(entities.privateIndividual, {
			searchMethod: 'GET',
			apiName: "PrivateIndividual",
			plural: "PrivateIndividuals"
		}),
		legalEntity: new ModelAPI(entities.legalEntity, {
			searchMethod: 'GET',
			apiName: "LegalEntity",
			plural: "LegalEntities"
		})
	};
}
