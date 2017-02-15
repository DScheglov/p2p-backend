'use strict';

const modelAPI = require('./api');
const models = require('../models').models;

modelAPI.expose(models.Institution, {
  expose: {"*": true},
  options: false,
  searchFields: {}
})

module.exports = exports = modelAPI;
