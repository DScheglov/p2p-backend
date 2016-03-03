var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductSchema = require("./products").ProductSchema.options;

var contractStatuses = ["new", "active", "closed"];
var ContractSchema = new Schema({
  institution: {type: Schema.Types.ObjectId, ref: "Institution", required: true},
  legalNumber: String,
  legalDate: {type: Date, required: false},
  status: {type: String, enum: contractStatuses, required: true, default: contractStatuses[0]},
  statusDate: {type: Date, required: true},
  owner: {type: Schema.Types.ObjectId, required: true, ref: "Entity"},
  accounts: {
    gateway: {type: String, required: false, ref: "Account"}
  },
  productCode: {type: String, required: true},
  product: {type: ProductSchema, required: true}
});
ContractSchema.index({"institution": 1});
ContractSchema.index({"productCode": 1});
ContractSchema.index({"owner": 1});
ContractSchema.index({"status": 1});
ContractSchema.index({"legalNumber": 1}, {sparse: true});
ContractSchema.index({"legalDate": 1}, {sparse: true})

ContractSchema.pre("validate", function (next) {
  if (this.isNew || this.isModified("status")) {
    this.statusDate = new Date();
  }
  next();
});

ContractSchema.pre("validate", function (next) {

  if (this.product) return next();
  var self = this;
  var Product = mongoose.model("Product");
  return Product.findOne({
    institution: this.institution,
    code: this.productCode
  }, function (err, p){
    if (err) return next(err);
    if (!p) return next(
      new Error("Product was not found.")
    );
    self.product = p.toObject();
    next();
  });
});

ContractSchema.pre("save", function(next) {
  var event = null;

  if (this.isNew) {
    event = "creation";
  } else if (this.isModified("status") && this.status == "active") {
    event = "acceptance";
  }

  if (!event) return next();

  var ProductPolicy = mongoose.model("AccountingProductPolicy");
  ProductPolicy.ensureAccounts(
    this.product.accountingPolicy, this, event, next
  );
});

var Contract = mongoose.model("Contract", ContractSchema);

module.exports = exports = {
  Contract: Contract
}
