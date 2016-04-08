var async = require("async");
var assert = require("assert");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var statusHistory = require('./plugins/status-history');
var ensureCallback = require('./tools/ensure').callback;
var ensureId = require('./tools/ensure').id;
var log = require('../lib/logger')(module);

var accountTypes = ['Assets', 'Liability'];
var accountStatuses = ["preopen", "open", "frozen", "closed"];
var AccountSchema = new Schema({
  _id: String,
  title: {type: String, required: true},
  type: {type: String, enum: accountTypes, required: true},
  GLNumber: String,
  debit: {type: Number, 'default': 0, required: true},
  credit: {type: Number, 'default': 0, required: true},
  currentDebit: {type: Number, default: 0, required: true},
  currentCredit: {type: Number, default: 0, required: true},
  currency: {type: String, required: true},
  _pendingDebit: [{type: Schema.Types.ObjectId, ref: "Transaction"}],
  _pendingCredit: [{type: Schema.Types.ObjectId, ref: "Transaction"}],
  institution: {type: Schema.Types.ObjectId, ref: "Institution", required: true},
  owner: {type: Schema.Types.ObjectId, ref: "Entity", required: false}
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
AccountSchema.virtual("number").set(setAccountNumber).get(getAccountNumber);
AccountSchema.virtual("balance").get(getBalance);
AccountSchema.plugin(statusHistory, {statusList: accountStatuses});

AccountSchema.index({type: 1});
AccountSchema.index({GLNumber: 1});
AccountSchema.index({owner: 1});
AccountSchema.index({institution: 1});
AccountSchema.index({currency: 1});
AccountSchema.index({status: 1});

AccountSchema.statics.closeOperatingDate = closeOperatingDateForAll;
AccountSchema.methods.closeOperatingDate = closeOperatingDate;

// ======================================================================== //
// Interface
//

module.exports = exports = {
  Account: mongoose.model("Account", AccountSchema),
  accountTypes: accountTypes
};

//
// implementation
//

/**
 * setAccountNumber - sets the _id of the account in account number
 *
 * @param  {string} v account number to be set
 * @return {string}   account number that was set out
 */
function setAccountNumber(v) {
  this._id = v;
  return v;
}

/**
 * getAccountNumber - returns _id of account as its number
 *
 * @return {string}  account number
 */
function getAccountNumber() {
  return this._id;
}


/**
 * getBalance - returns the balance of the account respectively to account type
 *
 * @return {number}  description
 */
function getBalance() {
  var balance = this.debit - this.credit;
  return (this.type == "Assets")?balance:-balance;
}

/**
 * closeOperatingDate -
 *
 * @param  {type} options  description
 * @param  {type} callback description
 * @return {type}          description
 */
function closeOperatingDate(options, callback) {
  var self = this;
  var dB = mongoose.model("DailyBalance");
  var closingDate = options.operatingDate;

  var balanceToStore = new dB({
    institution: this.institution,
    operatingDate: closingDate,
    account: this._id,
    debit: this.debit,
    credit: this.credit,
    currentDebit: this.currentDebit,
    currentCredit: this.currentCredit
  });

  self.currentDebit = self.currentCredit = 0;

  return async.waterfall([
    function (next) {
      next = ensureCallback.apply(null, arguments);
      balanceToStore.save(next)
    }, function (_db, next) {
      next = ensureCallback.apply(null, arguments);
      self.save(next)
    }
  ], callback);
}

function closeOperatingDateForAll(options, callback) {
  try {
    assert.ok(options, "You should specify options");
    assert.ok(options.operatingDate, "You should specify closing operatingDate");
    assert.ok(options.institution, "You should specify institution");
  } catch(e) {
    return callback(e);
  }

  var Account = this;
  var accounts = 0;
  var AccountStream = Account.find({
    institution: ensureId(options, 'institution'),
    status: "open"
  }).stream(
  ).on("data", function(account) {
    var _stream = this;
    log.info("Trying to call closeOperatingDate for Account: %s", account._id);
    if (account.closeOperatingDate instanceof Function) {
      _stream.pause();
      account.closeOperatingDate(options, function (err) {
        if (!err) accounts++;
        toLog(err, account);
        _stream.resume();
      });
    }
  }).on("error", function(err) {
    return callback(err);
  }).on("close", done);

  function done() {
    callback(null, {accounts: accounts});
  }

  function toLog(err, doc) {
    if (err) {
      console.dir(err.errors);
      return log.error(err);
    }
    return log.info("date closed for Account: %s", doc._id);
  }
}
