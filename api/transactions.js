var transactions = require('../models/transactions');

module.exports = exports = function (ModelAPI) {
  return {
    Transaction: new ModelAPI(transactions.Transaction, {
      searchMethod: 'GET',
      expose: {
        "*": true
      }
    })
  };
}
