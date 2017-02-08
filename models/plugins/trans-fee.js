var async = require('async');
var mongoose = require('../../mongoose');
var Schema = mongoose.Schema;
var ensureCallback = require('../tools/ensure').callback;

module.exports = exports = transFeeFactory;

function transFeeFactory(schema, options) {

  var modelName;
  var model;
  if (typeof(options.model) === "string") {
    modelName = options.model;
    model = mongoose.model(modelName);
  } else {
    model = options.model;
    modelName = options.model.modelName;
  }
  schema.add({
    fee: {type: Schema.Types.ObjectId, ref: modelName, required: false}
  });
  schema.index({fee: 1}, {sparse: 1});
  schema.methods.execute = execWithFee(model, options.path);

}


function execWithFee(txFee, feePath) {
  var Transaction = mongoose.model("Transaction");
  var $__originalExecute = Transaction.schema.methods.execute;

  return function () {
    var callback = ensureCallback.apply(null, arguments);
    var self = this;
    var fee = 0;
    var tFee = null;

    return async.waterfall([
      calculateFee,
      transactFee,
      transact
    ], function(err) {
      if (err) return rollback_fee(err, callback);
      return self.populate("accounts.current", callback);
    });

    function calculateFee() {
      var next = ensureCallback.apply(null, arguments);
      var theFee = self.get(feePath);
      if (!theFee) return next();
      fee = theFee.calculate(self.amount);
      return next();
    }

    function transactFee() {
      var next = ensureCallback.apply(null, arguments);
      if (fee > 0) {
        tFee = new txFee({
          amount: fee,
          status: "approved",
          globalUniqueTag: self.globalUniqueTag,
          baseContract: self.baseContract,
          strictMode: true
        });
        return tFee.execute(next);
      }
      return next();
    }

    function transact() {
      var next = ensureCallback.apply(null, arguments);
      if (tFee) self.fee = tFee;
      $__originalExecute.call(self, next);
    }

    function rollback_fee(err) {
      var next = ensureCallback.apply(null, arguments);
      if (!tFee || tFee.status !== "done") return next(err);

      tFee.statusDescription = err.message
      return tFee.cancel(function(error) {
        if (error) return next(
          new Error(err.message + " " + error.message)
        );
        return next(err);
      });
    }

  }
}
