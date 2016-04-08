var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var dailyBalanceSchema = new Schema({
  institution: {type: Schema.Types.ObjectId, ref: "Institution", required: true},
  operatingDate: {type: Date, required: true},
  account: {type: String, ref: "Account", required: true},
  debit: {type: Number, required:true},
  credit: {type: Number, required: true},
  currentDebit: {type: Number, required: true},
  currentCredit: {type: Number, required: true}
});
dailyBalanceSchema.index({institution: 1});
dailyBalanceSchema.index({operatingDate: 1});
dailyBalanceSchema.index({account: 1, operatingDate: 1}, {unique: 1});

var DailyBalance = mongoose.model("DailyBalance", dailyBalanceSchema);

module.exports = exports = {
  DailyBalance: DailyBalance
}
