'use strict';

const modelAPI = require('./api');
const models = require('../models').models;

modelAPI.expose(models.Transaction, {
  expose: {
    "*": true
  }
});

module.exports = exports = modelAPI;
