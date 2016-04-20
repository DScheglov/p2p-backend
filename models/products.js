var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var statusHistory = require("./plugins/status-history");
var roundPlugin = require('./plugins/round');

var productStatuses = ["new", "active", "close"];
var ProductSchema = new Schema({
  institution: {type: Schema.Types.ObjectId, required: true},
  code: {type: String, required: true},
  title: {type: String, required: true},
  description: String,
  category: {type: String, required: true, pattern: /[0-9A-Z_-](\/[0-9A-Z_-])*/},
  accountingPolicy: {type: Schema.Types.ObjectId, ref: "AccountingProductPolicy", required: true},
  status: {type: String, enum: productStatuses, required: true, default: productStatuses[0]},
  statusDate: {type: Date, required: true},
  tags: [String],
  productParams: {type: Schema.Types.Mixed, required: true, default: {} }
});
ProductSchema.plugin(statusHistory, {statusList: productStatuses});
ProductSchema.plugin(roundPlugin);
ProductSchema.index({"institution": 1});
ProductSchema.index({"institution": 1, "code": 1}, {unique: 1});
ProductSchema.index({"institution": 1, "category": 1});
ProductSchema.index({"tags": 1}, {sparse: true});

ProductSchema.post("save", preSave);

// ======================================================================== //
// Interface
//

module.exports = exports = {
  Product: mongoose.model("Product", ProductSchema)
};

// ======================================================================== //
// Implementation
//

function preSave(p) {
  var Contract = mongoose.model("Contract");
  return Contract.update({
    institution: p.institution,
    productCode: p.code,
    status: {$ne: "closed"},
  }, {
    $set: {
      product: p.toObject()
    }
  }, {multi: true}).exec();
}
