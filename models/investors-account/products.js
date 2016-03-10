var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Product = require("../products").Product;

var InvestorAccountProductSchema = new Schema({
  withdrawlFee : {type: Number, require: true, default: 0},
  positiveBalanceAPR: {type: Number, required: true, default: 0},
  accrueInterestsOnTheFirstDay: {type: Boolean, required: true, default: false},
  accounts: {
    incomingGateway: {type: String, ref: 'Account'},
    outgoingGateway: {type: String, ref: 'Account'},
    incomes: {type: String, ref: 'Account'},
    expenses: {type: String, ref: 'Account'}
  }
});

var InvestorAccountProduct = Product.discriminator(
  "InvestorAccountProduct", InvestorAccountProductSchema
);

module.exports = exports = {
  InvestorAccountProduct: InvestorAccountProduct,
  InvestorAccountProductSchema: InvestorAccountProductSchema
}
