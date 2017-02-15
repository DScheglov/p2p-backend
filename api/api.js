const merest = require('merest-swagger');
const config = require('../config');
const modelAPI = new merest.ModelAPIExpress({
  title: 'P2P Backend API',
  host: `${config.host}:${config.port}`,
  path: '/api/v1',
  options: false
});

module.exports = exports = modelAPI;
