var mongoose = require("mongoose");
var Schema = mongoose.Schema;

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
  active: {
    from: Date,
    to: Date
  },
  tags: [String],
  productParams: {type: Schema.Types.Mixed, required: true, default: {} }
});

ProductSchema.index({"institution": 1});
ProductSchema.index({"institution": 1, "code": 1}, {unique: 1});
ProductSchema.index({"institution": 1, "status": 1});
ProductSchema.index({"institution": 1, "category": 1});
ProductSchema.index({"tags": 1}, {sparse: true});

ProductSchema.pre("validate", function(next) {
  if (this.isNew || this.isModified("status")) {
    this.statusDate = new Date();
    if (this.status === "active") {
      this.active = this.active || {};
      this.active.from = this.statusDate;
    } else if (this.status === "closed") {
      this.active = this.active || {};
      this.active.to = this.statusDate;
    }

  }
  next();
});

ProductSchema.post("save", function(p) {
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
});

var Product = mongoose.model("Product", ProductSchema);

module.exports = exports = {
  Product: Product,
  ProductSchema: ProductSchema
};
