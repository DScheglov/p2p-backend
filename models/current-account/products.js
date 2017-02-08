var mongoose = require("../../mongoose");
var Schema = mongoose.Schema;
var Product = require("../products").Product;
var FeeSchema = require('../fees').FeeSchema;

var CurrentAccountProductSchema = new Schema({
  withdrawlFee : {type: FeeSchema, require: true, default: {rate: 0}},
  positiveBalanceAPR: {type: Number, required: true, default: 0},
  accrueInterestsOnTheFirstDay: {type: Boolean, required: true, default: false},
  accounts: {
    incomingGateway: {type: String, ref: 'Account'},
    outgoingGateway: {type: String, ref: 'Account'},
    incomes: {type: String, ref: 'Account'},
    expenses: {type: String, ref: 'Account'}
  }
});

var CurrentAccountProduct = Product.discriminator(
  "CurrentAccountProduct", CurrentAccountProductSchema
);

module.exports = exports = {
  CurrentAccountProduct: CurrentAccountProduct,
  CurrentAccountProductSchema: CurrentAccountProductSchema
}
