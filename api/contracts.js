'use strict';

const modelAPI = require('./api');
const models = require('../models').models;

modelAPI.expose(models.Contract, {
  exposeStatic: { "*": true }
})

module.exports = exports = modelAPI;
