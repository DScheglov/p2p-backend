var transactions = require('../models/transactions');

module.exports = exports = function (ModelAPI) {

  Transaction: ModelAPI.expose(transactions.Transaction, {
    searchMethod: 'GET',
    expose: {
      "*": true
    }
  })
  return {};
}
