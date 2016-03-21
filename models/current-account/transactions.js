
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Transaction = require("../transactions").Transaction;

var tx_CA_Refill_Schema = new Schema({
  type: {type: String, required: true, default: "CURRENT_ACCOUNTS/REFILLING"},
  description: {type: String, default: "Reffiling Investors account from external account"}
});

var tx_CA_Withdraw_Schema = new Schema({
  type: {type: String, required: true, default: "CURRENT_ACCOUNTS/WITHDRAWL"},
  description: {type: String, default: "Withdrawal to external account"}
});

var tx_CA_Withdrawl_Fee_Schema = new Schema({
  type: {type: String, required: true, default: "CURRENT_ACCOUNTS/FEES/WITHDRAWL"},
  description: {type: String, default: "Withdrawal fee"},
  globalUniqueTag: {type: String, required: false}
});

tx_CA_Withdrawl_Fee_Schema.path("globalUniqueTag").set(function (v) {
  return this.type + ":" + v;
});

var tx_CA_Interests_Acrruing_Schema = new Schema({
  type: {type: String, required: true, default: "CURRENT_ACCOUNTS/INTERESTS/ACCRUING"},
  description: {type: String, default: "Interests accuruing"}
});

tx_CA_Interests_Acrruing_Schema.pre("save", function (next) {
  this.globalUniqueTag = this._id + ":" + this.type + ":" + this.operatingDate;
  next();
});

var tx_CA_Interests_Payout_Schema = new Schema({
  type: {type: String, required: true, default: "CURRENT_ACCOUNTS/INTERESTS/PAYOUT"},
  description: {type: String, default: "Interests payout"}
});


var tx_CA_Refill = Transaction.discriminator(
  "tx_CA_Refill", tx_CA_Refill_Schema
);

var tx_CA_Withdraw = Transaction.discriminator(
  "tx_CA_Withdraw", tx_CA_Withdraw_Schema
);

var tx_CA_Withdrawl_Fee = Transaction.discriminator(
  "tx_CA_Withdrawl_Fee", tx_CA_Withdrawl_Fee_Schema
);

var tx_CA_Interests_Acrruing = Transaction.discriminator(
  "tx_CA_Interests_Acrruing", tx_CA_Interests_Acrruing_Schema
);

var tx_CA_Interests_Payout = Transaction.discriminator(
  "tx_CA_Interests_Payout", tx_CA_Interests_Payout_Schema
);

module.exports = exports = {
  CA_Refill: tx_CA_Refill,
  CA_Withdraw: tx_CA_Withdraw,
  CA_Withdrawl_Fee: tx_CA_Withdrawl_Fee,
  CA_Interests_Acrruing: tx_CA_Interests_Acrruing,
  CA_Interests_Payout: tx_CA_Interests_Payout
};
