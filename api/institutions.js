'use strict';

const modelAPI = require('./api');
const models = require('../models').models;

modelAPI.expose(models.Institution, {
  expose: {"*": true}
})

module.exports = exports = modelAPI;
