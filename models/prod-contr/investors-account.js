var utils = require("util");
var assert = require("assert");
var async = require("async");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Product = require("../products").Product;
var Contract = require("../contracts").Contract;

var InvestorAccountProductSchema = new Schema({
  withdrawlFee : {type: Number, require: true, default: 0},
  positiveBalanceAPR: {type: Number, required: true, default: 0},
  accounts: {
    incomingGateway: {type: String, ref: 'Account'},
    outgoingGateway: {type: String, ref: 'Account'},
    incomes: {type: String, ref: 'Account'},
    expenses: {type: String, ref: 'Account'}
  }
});

var InvestorAccountContractSchema = new Schema({
  product: {type: InvestorAccountProductSchema.options, required: true},
  accounts: {
    current: {type: String, ref: "Account"},
    holds: {type: String, ref: "Account"},
    interests: {type: String, ref: "Account"}
  }
});
InvestorAccountContractSchema.statics.refill = wrapInstanceMethod("refill");
InvestorAccountContractSchema.methods.refill = refillAccount;
function refillAccount(options, callback) {
  try {
    assert.ok(options && options.amount, "Specify the amount of the refilling.");
    assert.ok(options.amount > 0, "The amount of refilling must be greate then 0");
    assert.ok(options && options.tag, "All exposed operations requires the unique tag. Specify tag");
  } catch(e) {
    return callback(e);
  }
  var self = this;
  var Tx = mongoose.model("Transaction");
  var t = new Tx({
    debitAccount: this.product.accounts.incomingGateway,
    creditAccount: this.accounts.current,
    amount: options.amount,
    type: "INV_ACCOUNTS/REFILLING",
    description: options.description || "Reffiling Investors account from external account",
    status: "approved",
    globalUniqueTag: options.tag
  });

  return t.execute(function (err, t) {
    if (err) return callback(err);
    return self.populate("accounts.current", callback);
  });

}
InvestorAccountContractSchema.statics.withdraw = wrapInstanceMethod("withdraw");
InvestorAccountContractSchema.methods.withdraw = withdrawAmount;
function withdrawAmount(options, callback) {
  try {
    assert.ok(options && options.amount, "Specify the amount of the withdrawl.");
    assert.ok(options.amount > 0, "The amount of withdrawl must be greate then 0");
    assert.ok(options && options.tag, "All exposed operations requires the unique tag. Specify tag");
  } catch(e) {
    return callback(e);
  }
  var self = this;
  var Tx = mongoose.model("Transaction");
  var fee = Math.round(this.product.withdrawlFee * options.amount);
  var tFee = null;
  if (fee > 0) {
    var tType = "INV_ACCOUNTS/FEES/WITHDRAWL";
    tFee = new Tx({
      debitAccount: this.accounts.current,
      creditAccount: this.product.accounts.incomes,
      amount: fee,
      type: tType,
      description: "Withdrawal fee",
      status: "approved",
      globalUniqueTag: tType+":"+options.tag,
      strictMode: true
    });
  }
  var tWithdraw = new Tx({
    debitAccount: this.accounts.current,
    creditAccount: this.product.accounts.outgoingGateway,
    amount: options.amount,
    type: "INV_ACCOUNTS/WITHDRAWL",
    description: "Withdrawal to external account",
    status: "approved",
    globalUniqueTag: options.tag,
    strictMode: true
  });
  return async.waterfall([
    tFee.execute.bind(tFee),
    tWithdraw.execute.bind(tWithdraw)
  ], function(err) {
    if (err) {
      if (tFee.status === "done") {
        tFee.statusDescription = err.message
        return tFee.cancel(
          function(error) {
            if (error) return callback(
              new Error(err.message + " "+error.message)
            );
            callback(err);
          }
        );
      }
     return callback(err);
    }
    return self.populate("accounts.current", callback);
  });
}
function wrapInstanceMethod(method) {
  return function (options, callback) {
    var Contract = mongoose.model("InvestorAccountContract");
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


var InvestorAccountProduct = Product.discriminator(
  "InvestorAccountProduct", InvestorAccountProductSchema
);

var InvestorAccountContract = Contract.discriminator(
  "InvestorAccountContract",  InvestorAccountContractSchema
);

module.exports = exports = {
  InvestorAccountProduct: InvestorAccountProduct,
  InvestorAccountContract: InvestorAccountContract
}
