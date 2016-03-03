var async = require("async");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ensureCallback = require("./tools/safe-callback").ensureCallback;
var ensureId = require("./tools/ensure-id");

var transStatuses = ["new", "approved", "pending", "applied", "canceling", "done", "failed"];

var TransactionSchema = Schema({
  institution: {type: Schema.Types.ObjectId, ref: "Institution", required: true},
  debitAccount: {type: String, required: true, ref: "Account"},
  creditAccount: {type: String, required: true, ref: "Account"},
  amount: {type: Number, required: true},
  description: {type: String, required: true},
  type: {type: String, required: true},
  status: {type: String, enum: transStatuses, required: true, 'default': transStatuses[0]},
  statusDescription: String,
  lastModified: {type: Date, required: true, 'default': Date.now },
  operatingDate: {type: Date, required: true},
  strictMode: {type: Boolean, default: false, required: true},
  globalUniqueTag: {type: String, required: false},
  contract: {type: Schema.Types.ObjectId, ref: "Contract", required: false}
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
TransactionSchema.index({"institution": 1});
TransactionSchema.index({"debitAccount": 1});
TransactionSchema.index({"creditAccount": 1});
TransactionSchema.index({"type": 1});
TransactionSchema.index({"status": 1});
TransactionSchema.index({"operatingDate": 1});
TransactionSchema.index({"globalUniqueTag": 1}, {unique: true, sparse: true});
TransactionSchema.index({"contract":1}, {sparse: true});

TransactionSchema.pre('validate', function (next) {

  if (!this.isNew) return next(); // Don't do for old transactions

  var Account = mongoose.model('Account');
  var accountsToBeLoaded = [];
  var self = this;
  if (!this.debitAccount._id) {
    accountsToBeLoaded.push(['debitAccount', true]);
  }
  if (!this.creditAccount._id) {
    accountsToBeLoaded.push(['creditAccount', false]);
  }
  return async.each(accountsToBeLoaded, function (aObj, cb) {
    var aName = aObj[0];
    var needPopulate = aObj[1];
    var Q = Account.findById(self[aName]);
    if (needPopulate) Q = Q.populate("institution");
    Q.exec(function (err, A) {
      if (!A) return cb(
        new Error("Account ["+aName+"]="+self[aName]+" is not found.")
      );
      self[aName] = A;
      cb();
    });
  }, function(err) {
    if (err) return next(err);
    var dAI = ensureId(self.debitAccount, "institution");
    var cAI = ensureId(self.creditAccount, "institution");
    if (!dAI || ! cAI) return next(
      new Error("Cann't to execute transaction for Account that is out of Institution")
    );
    if (dAI.toString() != cAI.toString()) return next(
      new Error("Cann't to execute transaction for Accounts that aren't in the same Institution")
    );
    self.institution = self.debitAccount.institution;
    self.operatingDate = self.institution.operatingDate;
    next();
  });
});

TransactionSchema.methods.verify = function() {
  return true;
}

TransactionSchema.methods.approve = function(callback) {
  callback = ensureCallback.apply(null, arguments);
  if (this.verify()) {
    this.status = "approved";
    return this.save(callback);
  };
};

TransactionSchema.methods.cancel = function(callback) {
  var tx = this;
  if (tx.status !== 'done') return callback(
    new Error("Status of transaction doesn't allow it to be canceled.")
  );
  var Account = mongoose.model('Account');

  return async.waterfall([
    function (next) {
      Account.findOneAndUpdate({
        _id: tx.debitAccount,
        _pendingDebit: {$ne: tx._id},
        status: "open"
      }, {
        $push: {_pendingDebit: tx._id}
      }, {new: 1}, function (err, acc) {
        if (err) return next(err);
        if (!acc) return next(new Error("Status of Account doesn't allow to cancel operations on it"));
        next();
      });
    },
    function (next) {
      Account.findOneAndUpdate({
        _id: tx.creditAccount,
        _pendingCredit: {$ne: tx._id},
        status: {$in: ["open", "preopen"]}
      }, {
        $push: {_pendingCredit: tx._id}
      }, {new: 1}, function (err, acc) {
        if (err) return next(err);
        if (!acc) return next(new Error("Status of Account doesn't allow to cancel operations on it"));
        next();
      });
    },
    function (next) {
      tx.status = "canceling";
      tx.lastModified = new Date();
      tx.save(next);
    }
  ], function (err) {
    if (err) return callback(err);
    return tx.execute(callback);
  });

}

TransactionSchema.methods.execute = function (callback) {
  var Account = mongoose.model('Account');
  var tx = this;

  callback = ensureCallback.apply(null, arguments);

  switch (tx.status) {
    case "approved":  return tx_start();
    case "pending":    return tx_apply();
    case "applied":   return tx_push();
    case "canceling":   return tx_rollback();
  };

  return callback(new Error("Transaction status doesn't allow it to be executed."), tx);

  function tx_fail(err) {
    var fail_err = err;
    if (err) tx.statusDescription = err.message;
    tx.status = "failed";
    tx.lastModified = new Date();
    return tx.save(function(err) {
      if (err) return callback(err, tx);
      callback(fail_err || new Error("Transaction failed"), tx);
    });
  };

  function tx_start() {
    tx.status = "pending";
    tx.lastModified = new Date();
    tx.save(function(err, obj) {
      if (err) return tx_fail(err);
      return tx_apply();
    });
  };

  function _do(next) {
    return function(err, obj) {
      return next(err);
    };
  }

  function tx_apply() {
    if (tx.status != "pending") return;
    async.waterfall([
      function (next) {
        Account.findOneAndUpdate({
          _id: tx.debitAccount,
          _pendingDebit: {$ne: tx._id},
          status: "open"
        }, {
          $inc: {debit: tx.amount},
          $push: {_pendingDebit: tx._id}
        }, {new: 1}, function (err, acc) {
          if (err) return next(err);
          if (!acc) return next(new Error("Status of Account doesn't allow to debit it"));
          if (tx.strictMode) {
            var balance = acc.credit - acc.debit;
            if (acc.type === "Assets") balance = -balance;
            if (balance < 0) return next(new Error("Red saldo of Debit Account"));
          }
          next();
        });
      },
      function (next) {
        Account.findOneAndUpdate({
          _id: tx.creditAccount,
          _pendingCredit: {$ne: tx._id},
          status: {$in: ["open", "preopen"]}
        }, {
          $inc: {credit: tx.amount},
          $push: {_pendingCredit: tx._id}
        }, {new: 1}, function (err, acc) {
          if (err) return next(err);
          if (!acc) return next(new Error("Status of Account doesn't allow to credit it"));
          if (tx.strictMode) {
            var balance = acc.credit - acc.debit;
            if (acc.type === "Assets") balance = -balance;
            if (balance < 0) return next(new Error("Red saldo of Credit Account"));
          }
          next();
        });
      },
      function (next) {
        tx.status = "applied";
        tx.lastModified = new Date();
        tx.save(_do(next));
      }
    ], function (err) {
      if (err) return tx_rollback(err);
      tx_push();
    });
  };

  function tx_push() {
    if (tx.status != "applied") return;
    async.waterfall([
      function (next) {
        Account.update({
          _id: tx.debitAccount,
          _pendingDebit: tx._id
        }, {
          $pull: {_pendingDebit: tx._id}
        }, _do(next));
      },
      function (next) {
        Account.update({
          _id: tx.creditAccount,
          _pendingCredit: tx._id
        }, {
          $pull: {_pendingCredit: tx._id}
        }, _do(next));
      },
      function (next) {
        tx.status = "done";
        tx.lastModified = new Date();
        tx.save(_do(next));
      }
    ], function (err) {
        if (err) return callback(err, tx);
        callback(null, tx);
      }
    );
  };

  function tx_rollback(err) {
    var rollback_err = err;
    async.waterfall([
      function (next) {
        tx.status = "canceling";
        tx.lastModified = new Date();
        tx.save(_do(next));
      },
      function (next) {
        Account.update({
          _id: tx.creditAccount,
          _pendingCredit: tx._id
        }, {
          $inc: {credit: -tx.amount},
          $pull: {_pendingCredit: tx._id}
        }, _do(next));
      },
      function (next) {
        Account.update({
          _id: tx.debitAccount,
          _pendingDebit: tx._id
        }, {
          $inc: {debit: -tx.amount},
          $pull: {_pendingDebit: tx._id}
        }, _do(next));
      }
    ], function (err) {
        if (err) return callback(err, tx);
        return tx_fail(rollback_err);
      }
    );
  };
};

TransactionSchema.methods.approveAndExecute = function(callback) {
  var self = this;
  return self.approve(function(err) {
    if (err) return callback(err);
      self.execute(callback);
  })
};

var Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = exports = {
  Transaction: Transaction
};
