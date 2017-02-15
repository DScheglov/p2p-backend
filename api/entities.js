'use strict';

const modelAPI = require('./api');
const models = require('../models').models;

modelAPI.expose(models.PrivateIndividual, {
  apiName: "PrivateIndividual",
  plural: "PrivateIndividuals",
  options: false
});

modelAPI.expose(models.LegalEntity, {
  apiName: "LegalEntity",
  plural: "LegalEntities",
  options: false
});

module.exports = modelAPI;
