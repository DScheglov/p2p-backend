'use strict';
const hostInfo = require('./host.json');

module.exports = exports = Object.assign({}, hostInfo, {
  env: 'test'
});
