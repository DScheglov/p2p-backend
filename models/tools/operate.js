var assert = require('assert')
var mongoose = require('../../mongoose');
var ensureCallback = require('./ensure').callback;
module.exports = exports = operate;

function operate(Tx, accountToPopulate) {

  if (typeof(Tx) === "string") {
    Tx = mongoose.model(Tx);
  };

  return function (options) {
    var self = this;
    var callback = ensureCallback.apply(null, arguments);
    try {
      assert.ok(options && options.amount, "Specify the amount of the operation.");
      assert.ok(options.amount > 0, "The amount of operation must be greater then 0.");
      assert.ok(options && options.tag, "All exposed operations requires the unique tag. Specify tag");
    } catch(e) {
      if (callback) return callback(e);
      throw e;
    };

    var t = new Tx({
      amount: options.amount,
      description: options.description,
      status: "approved",
      baseContract: self,
      globalUniqueTag: options.tag
    });

    return t.execute(function (err, t) {
      if (err) {
        if (callback) return callback(err);
        throw err;
      }
      if (accountToPopulate) {
        return self.populate(accountToPopulate, callback);
      };
      return callback && callback(null, self) || self;
    });
  }
}
