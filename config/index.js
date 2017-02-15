'use strict';

const envMap = {
  '': 'dev',
  'development': 'dev',
  'dev': 'dev',
  'production': 'prod',
  'test': 'test'
}
const env = envMap[(process.env.NODE_ENV || '').toLowerCase()] || 'dev';

module.exports = exports = require(`./config.${env}`);
