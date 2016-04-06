var utils = require("util");
var assert = require("assert");
var async = require("async");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Contract = require("../contracts").Contract;
var ensureCallback = require("../tools/safe-callback").ensureCallback;
var settlements = require('../tools/settlements');

var CurrentAccountProductSchema = require("./products").CurrentAccountProductSchema;
var tx = require("./transactions");

var CurrentAccountContract = new Schema({
  product: {type: CurrentAccountProductSchema.options, required: true},
  accounts: {
    current: {type: String, ref: "Account"},
    holds: {type: String, ref: "Account"},
    interests: {type: String, ref: "Account"}
  }
});

CurrentAccountContract.statics.refill = wrapInstanceMethod("refill");
CurrentAccountContract.methods.refill = refillAccount;
CurrentAccountContract.statics.withdraw = wrapInstanceMethod("withdraw");
CurrentAccountContract.methods.withdraw = withdrawAmount;
CurrentAccountContract.statics.accrueInterests = wrapInstanceMethod("accrueInterests");
CurrentAccountContract.methods.accrueInterests = accrueInterests;
CurrentAccountContract.statics.payoutInterests = wrapInstanceMethod("payoutInterests");
CurrentAccountContract.methods.payoutInterests = payoutInterests;
CurrentAccountContract.methods.closeOperatingDate = closeOperatingDate;
CurrentAccountContract.methods.openOperatingDate = openOperatingDate;

function refillAccount(options, callback) {
  try {
    assert.ok(options && options.amount, "Specify the amount of the refilling.");
    assert.ok(options.amount > 0, "The amount of refilling must be greate then 0");
    assert.ok(options && options.tag, "All exposed operations requires the unique tag. Specify tag");
  } catch(e) {
    return callback(e);
  }
  var self = this;

  var t = new tx.CA_Refill({
    debitAccount: this.product.accounts.incomingGateway,
    creditAccount: this.accounts.current,
    amount: options.amount,
    description: options.description,
    status: "approved",
    settlementPeriod: this.settlementPeriod.toObject(),
    contract: this._id,
    globalUniqueTag: options.tag
  });

  return t.execute(function (err, t) {
    if (err) return callback(err);
    return self.populate("accounts.current", callback);
  });

}

function withdrawAmount(options, callback) {
  var self = this;
  var fee = 0;
  var tFee = null;

  return async.waterfall([
    doAssert,
    calculateFee,
    transactFee,
    transact
  ], function(err) {
    if (err) return rollback_fee(err, callback);
    return self.populate("accounts.current", callback);
  });

  function doAssert(next) {
    try {
      assert.ok(options && options.amount, "Specify the amount of the withdrawl.");
      assert.ok(options.amount > 0, "The amount of withdrawl must be greate then 0");
      assert.ok(options.tag, "All exposed operations requires the unique tag. Specify tag");
    } catch(e) {
      return next(e);
    }
    return next();
  }

  function calculateFee(next) {
    fee = Math.round(self.product.withdrawlFee * options.amount);
    return next();
  }

  function transactFee(next) {
    if (fee > 0) {
      tFee = new tx.CA_Withdrawl_Fee({
        debitAccount: self.accounts.current,
        creditAccount: self.product.accounts.incomes,
        amount: fee,
        status: "approved",
        globalUniqueTag: options.tag,
        settlementPeriod: self.settlementPeriod.toObject(),
        contract: self,
        strictMode: true
      });
      return tFee.execute(next);
    }
    return next();
  }

  function transact(tFee, next) {
    var tWithdraw = new tx.CA_Withdraw({
      debitAccount: self.accounts.current,
      creditAccount: self.product.accounts.outgoingGateway,
      amount: options.amount,
      description: options.description,
      status: "approved",
      globalUniqueTag: options.tag,
      settlementPeriod: self.settlementPeriod.toObject(),
      contract: self,
      strictMode: true
    });
    return tWithdraw.execute(next);
  }

  function rollback_fee(err, next) {
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

function accrueInterests(callback) {
  var self = this;
  var interests = 0;
  var iTx = 0;

  callback = ensureCallback.apply(null, arguments);

  return async.waterfall([
    ensureInterestAccount,
    refreshCurrentBalance,
    calculateInterests,
    transact
  ], callback);

  function ensureInterestAccount(next) {
    if (self.accounts.interests) return next();
    var AccountingProductPolicy = mongoose.model("AccountingProductPolicy");
    return AccountingProductPolicy.ensureAccounts(
      self.product.accountingPolicy, self, ["interests"],
      function(err, account) {
        if (err) return next(err);
        self.save(next);
      }
    );
  }

  function refreshCurrentBalance(_self, next) {
    next = ensureCallback.apply(null, arguments);
    return self.populate("accounts.current", next);
  }

  function calculateInterests(_self, next) {
    var base = self.accounts.current.balance;
    if (!self.product.accrueInterestsOnTheFirstDay) {
      base -= self.accounts.current.currentCredit;
    };
    var rate = self.product.positiveBalanceAPR;
    interests = Math.round(base * rate / 365);
    next();
  }

  function transact(next) {
    if (interests === 0) return next();
    iTx = new tx.CA_Interests_Acrruing({
      debitAccount: self.product.accounts.expenses,
      creditAccount: self.accounts.interests,
      amount: interests,
      settlementPeriod: self.settlementPeriod.toObject(),
      contract: self,
      status: "approved"
    });
    return iTx.execute(next);
  }

}

/**
 * payoutInterests - Pays out accrued Interests by the contract
 *
 * @param  {Function} callback function that will be called when method completed
 * @return {async.promise}
 */
function payoutInterests(callback) {

  callback = ensureCallback.apply(null, arguments);

  var self = this;
  var interests = 0;

  return async.waterfall([
    refreshInterestsBalance,
    transact
  ], callback);

  function refreshInterestsBalance(next) {
    if (!self.accounts.interests) return next();

    return self.populate("accounts.interests", function (err, _self) {
      if (err) return next(err);
      interests = self.accounts.interests.balance || 0;
      return next();
    })
  }

  function transact(next) {
    if (interests === 0) return next();
    var pTx = new tx.CA_Interests_Payout({
      debitAccount: self.accounts.interests,
      creditAccount: self.accounts.current,
      amount: interests,
      contract: self,
      status: "approved",
      settlementPeriod: self.settlementPeriod.toObject(),
      strictMode: true
    });
    return pTx.execute(next);
  }
}

function closeOperatingDate(options, callback) {
  return this.accrueInterests(callback);
}

function openOperatingDate(options, callback) {
  try {
    assert.ok(options, "Specify options");
    assert.ok(options.operatingDate, "Specify new operatingDate in options");
  } catch(e) {
    return callback(e);
  }
  if (+options.operatingDate > +this.settlementPeriod.end) {
    settlements.nextPeriod.call(this.settlementPeriod);
    this.save(function (err, _self) {
      if (err) return callback(err);
      return _self.payoutInterests(callback);
    });

  }
  return callback();
}

function wrapInstanceMethod(method) {
  return function (options, callback) {
    var Contract = mongoose.model("CurrentAccountContract");
    var q = {};
    options = utils._extend({}, options);
    if (options.id) {
      q._id = options._id;
      delete options._id;
    }
    else if (options.legalNumber) {
      q.legalNumber = options.legalNumber;
      delete options.legalNumber;
    }
    Contract.findOne(q, function(err, contract) {
      if (err) return callback(err, null);
      if (!contract) return callback(
        new Error("Contract was not flound")
      );
      return contract[method](options, callback);
    })
  }
}

var CurrentAccountContract = Contract.discriminator(
  "CurrentAccountContract",  CurrentAccountContract
);

module.exports = exports = {
  CurrentAccountContract: CurrentAccountContract
}
