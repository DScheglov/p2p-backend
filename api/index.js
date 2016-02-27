var ModelAPI = require('model-api')();

module.exports = exports = function(app) {
	ModelAPI.assign(app, '/api', 'v1');

	var entitiesAPI = require('./entities')(ModelAPI);
	var accountsAPI = require('./accounts')(ModelAPI);
	var institutionsAPI = require('./institutions')(ModelAPI);
	var transactionsAPI = require('./transactions')(ModelAPI);

	ModelAPI
		.expose(institutionsAPI.Institution)
		.expose(entitiesAPI.privateIndividual)
		.expose(entitiesAPI.legalEntity)
		.expose(accountsAPI.Account)
		.expose(accountsAPI.AccountFactory)
		.expose(transactionsAPI.Transaction)
	;
	return ModelAPI;
}
