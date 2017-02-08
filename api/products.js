'use strict';

const modelAPI = require('./api');
const models = require('../models').models;

modelAPI.expose(models.Product);

module.exports = exports = modelAPI;
