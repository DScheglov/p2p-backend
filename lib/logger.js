var winston = require('winston');
var expressWinston = require('express-winston');

function getLogger(_module, isMiddleware) {

  var transports = [];

  if (require("./env") !== 'TEST') {

    transports.push(
      new winston.transports.Console({
        colorize: true,
        level: 'debug',
        label: _module.filename.split('/').slice(-2).join('/')
      })
    );

  }

  if (!!isMiddleware) {
    return expressWinston.logger({transports : transports});
  }

  return  new (winston.Logger)({transports : transports});
}

module.exports = getLogger;
