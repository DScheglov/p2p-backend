var utils = require("util");
var assert = require("assert");
var async = require("async");
var mongoose = require("../../mongoose");
var Schema = mongoose.Schema;

var Contract = require("../contracts").Contract;
var ensureCallback = require("../tools/ensure").callback;
var operate = require('../tools/operate');
var settlements = require('../tools/settlements');
var log = require('../../lib/logger')(module);

var CurrentAccountProductSchema = require("./products").CurrentAccountProductSchema;
var tx = require("./transactions");

var CurrentAccountContract = new Schema({
  product: {type: CurrentAccountProductSchema, required: true},
  accounts: {
    current: {type: String, ref: "Account"},
    holds: {type: String, ref: "Account"},
    interests: {type: String, ref: "Account"}
  }
});

CurrentAccountContract.statics.refill = wrapInstanceMethod("refill");
CurrentAccountContract.methods.refill = operate(tx.CA_Refill, "accounts.current");
CurrentAccountContract.statics.withdraw = wrapInstanceMethod("withdraw");
CurrentAccountContract.methods.withdraw = operate(tx.CA_Withdraw, "accounts.current");
CurrentAccountContract.statics.accrueInterests = wrapInstanceMethod("accrueInterests");
CurrentAccountContract.methods.accrueInterests = accrueInterests;
CurrentAccountContract.statics.payoutInterests = wrapInstanceMethod("payoutInterests");
CurrentAccountContract.methods.payoutInterests = payoutInterests;

CurrentAccountContract.when('endOfDay', function(options, cb) {
  return this.accrueInterests(cb);
});

CurrentAccountContract.when('startOfPeriod', function(options, cb) {
  return this.payoutInterests(options, cb);
});

// ======================================================================== //
// Interface
//

var CurrentAccountContract = Contract.discriminator(
  "CurrentAccountContract",  CurrentAccountContract
);

module.exports = exports = {
  CurrentAccountContract: CurrentAccountContract
}

// ======================================================================== //
// Implementation
//

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
