var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FeeSchema = new Schema({
  rate: {type: Number, required: false, default: 0},
  min: {type: Number, required: false, default: 0},
  max: {type: Number, required: false, default: 0},
  fixed: {type: Number, required: false, default: 0}
}, {versioning: false, _id: false});

FeeSchema.methods.calculate = calculateFee;

module.exports = exports = {
  FeeSchema: FeeSchema
}

function calculateFee(base) {
  var product = ensureProductRound(this.$parent);
  var amount = 0;
  if (this.fixed) amount += amount;
  if (this.rate) amount += product.round(this.rate * base);
  if (this.min) amount = amount > this.min ? amount : this.min;
  if (this.max) amount = amount < this.max ? amount : this.max;
  return amount;
}

function ensureProductRound (product) {
  product = product || {};
  product.round = product.round || Math.round;
  if (!(product.round instanceof Function)) product.round = Math.round;
  return product;
}
