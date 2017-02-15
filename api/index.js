'use strict';

const modelAPI = require('./api');

require('./entities');
require('./accounts');
require('./institutions');
require('./transactions');
require('./accounting-policies');
//require('./products');
//require('./contracts');
require('./products/current-account');

modelAPI.exposeSwaggerUi();

module.exports = exports = modelAPI;
