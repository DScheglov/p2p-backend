var async = require("async");
var mongoose = require('../mongoose');
var Schema = mongoose.Schema;

var openOnEnum = ["creation", "acceptance", "first-usage"];
var accountingProductPolicySchema = new Schema({
  institution: {type: Schema.Types.ObjectId, required: true, ref: "Institution"},
  title: {type: String, required: true},
  description: String,
  factories: [{
    accountName: {type: String, required: true},
    factory: {type: Schema.Types.ObjectId, ref: "AccountFactory", required: true},
    openOn : {type: String, required: true, enum: openOnEnum, default: openOnEnum[0]}
  }]
});

accountingProductPolicySchema.index({"institution": 1});
accountingProductPolicySchema.statics.ensureAccounts = ensureAccounts;

var AccountingProductPolicy = mongoose.model(
  "AccountingProductPolicy", accountingProductPolicySchema
);

// ======================================================================== //
// Interface
//

module.exports = exports = {
  AccountingProductPolicy: AccountingProductPolicy
};

// ======================================================================== //
// Implementation
//

function ensureAccounts(policy, contract, eventOrAccounts, callback) {
  return this.findById(policy, function (err, p) {
    if (err) return callback(err, contract);
    if (!p) return callback(
      new Error("Product policy was not found."),
      contract
    );
    var Factory = mongoose.model("AccountFactory");
    var factoryToCall = [];
    var f;
    contract.accounts = contract.accounts || {};
    var accounts = null;
    var event = null;
    var filter = null;
    if (typeof(eventOrAccounts) === "string") {
      event = eventOrAccounts;
      filter = function(f) {
        return (f.openOn === event) && (!contract.accounts[f.accountName]);
      }
    } else {
      accounts = eventOrAccounts;
      filter = function(f) {
        return (accounts.indexOf(f.accountName) >= 0) &&
               (!contract.accounts[f.accountName]);
      }
    }
    factoryToCall = p.factories.filter(filter);
    async.each(factoryToCall, function(f, next) {
      Factory.openAccount({
        factory: f.factory,
        owner: contract.owner,
        status: "open"
      }, function(err, account) {
        if (err) return next(err);
        if (!account) return next(
          new Error("Unable to open account")
        );
        contract.accounts[f.accountName] = account;
        next()
      })
    }, function (err) {
      callback(err, contract);
    })
  });
};
