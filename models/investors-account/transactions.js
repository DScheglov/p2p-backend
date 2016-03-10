
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Transaction = require("../transactions").Transaction;

var tx_IA_Refill_Schema = new Schema({
  type: {type: String, required: true, default: "INV_ACCOUNTS/REFILLING"},
  description: {type: String, default: "Reffiling Investors account from external account"}
});

var tx_IA_Withdraw_Schema = new Schema({
  type: {type: String, required: true, default: "INV_ACCOUNTS/WITHDRAWL"},
  description: {type: String, default: "Withdrawal to external account"}
});

var tx_IA_Withdrawl_Fee_Schema = new Schema({
  type: {type: String, required: true, default: "INV_ACCOUNTS/FEES/WITHDRAWL"},
  description: {type: String, default: "Withdrawal fee"},
  globalUniqueTag: {type: String, required: false}
});

tx_IA_Withdrawl_Fee_Schema.path("globalUniqueTag").set(function (v) {
  return this.type + ":" + v;
});

var tx_IA_Interests_Acrruing_Schema = new Schema({
  type: {type: String, required: true, default: "INV_ACCOUNTS/INTERESTS/ACCRUING"},
  description: {type: String, default: "Interests accuruing"}
});

tx_IA_Interests_Acrruing_Schema.pre("save", function (next) {
  this.globalUniqueTag = this._id + ":" + this.type + ":" + this.operatingDate;
  next();
});

var tx_IA_Interests_Payout_Schema = new Schema({
  type: {type: String, required: true, default: "INV_ACCOUNTS/INTERESTS/PAYOUT"},
  description: {type: String, default: "Interests payout"}
});


var tx_IA_Refill = Transaction.discriminator(
  "tx_IA_Refill", tx_IA_Refill_Schema
);

var tx_IA_Withdraw = Transaction.discriminator(
  "tx_IA_Withdraw", tx_IA_Withdraw_Schema
);

var tx_IA_Withdrawl_Fee = Transaction.discriminator(
  "tx_IA_Withdrawl_Fee", tx_IA_Withdrawl_Fee_Schema
);

var tx_IA_Interests_Acrruing = Transaction.discriminator(
  "tx_IA_Interests_Acrruing", tx_IA_Interests_Acrruing_Schema
);

var tx_IA_Interests_Payout = Transaction.discriminator(
  "tx_IA_Interests_Payout", tx_IA_Interests_Payout_Schema
);

module.exports = exports = {
  IA_Refill: tx_IA_Refill,
  IA_Withdraw: tx_IA_Withdraw,
  IA_Withdrawl_Fee: tx_IA_Withdrawl_Fee,
  IA_Interests_Acrruing: tx_IA_Interests_Acrruing,
  IA_Interests_Payout: tx_IA_Interests_Payout
};
