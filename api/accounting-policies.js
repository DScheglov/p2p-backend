'use strict';

const modelAPI = require('./api');
const models = require('../models').models;

modelAPI.expose(models.AccountingProductPolicy, {
  plural: "ProductPolicies"
});

module.exports = exports = modelAPI;
