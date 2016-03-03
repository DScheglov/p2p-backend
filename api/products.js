var Product = require('../models/products').Product;

module.exports = exports = function (ModelAPI) {
  ModelAPI.expose(Product, {
    searchMethod: 'GET'
  });
  return {};
}
