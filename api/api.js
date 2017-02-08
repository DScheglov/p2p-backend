const merest = require('merest-swagger');
const modelAPI = new merest.ModelAPIExpress({
  title: 'P2P Backend API',
  host: 'ubuntu-local:1337', // Assign correct host that could be accessed from your network
  path: '/api/v1',
  options: false
});

module.exports = exports = modelAPI;
