var async = require("async");
var assert = require("assert");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductSchema = require("./products").ProductSchema.options;
var settlements = require("./tools/settlements");
var SettlementPeriodSchema = settlements.SettlementPeriodSchema;
var defineSP = settlements.define;
var ensureId = require("./tools/ensure-id");
var ensureCallback = require("./tools/safe-callback").ensureCallback;

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
  product: {type: ProductSchema, required: true},
  settlementPeriod: {
    type: SettlementPeriodSchema,
    required: false
  },
  settlementDayOfMonth: {type: Number, required: true, default: 1, min: 1, max: 28}
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
  }, function (err, p) {
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
  var self = this;
  var actions = [];

  if (this.isNew) {
    event = "creation";
  } else if (this.isModified("status") && this.status == "active") {
    event = "acceptance";
  }

  if (this.status === "active" && !this.settlementPeriod) {
    if (!this.institution.operatingDate) actions.push(populateInstitution);
    actions.push(defineSettlementPeriod);
  }

  if (event) actions.push(ensureAccounts);

  if (!actions.length) return next();

  async.waterfall(actions, function(err) {
    return next(err);
  });

  function populateInstitution() {
    var next = ensureCallback.apply(null, arguments);
    return self.populate("institution", next);
  }

  function defineSettlementPeriod() {
    var next = ensureCallback.apply(null, arguments);
    self.settlementPeriod = defineSP({
      operatingDate: self.institution.operatingDate,
      settlementDayOfMonth: self.settlementDayOfMonth
    });
    return next();
  }

  function ensureAccounts() {

    var next = ensureCallback.apply(null, arguments);
    var ProductPolicy = mongoose.model("AccountingProductPolicy");
    ProductPolicy.ensureAccounts(
      self.product.accountingPolicy, self, event, next
    );
  }

});

ContractSchema.statics.closeOperatingDate = function (options, callback) {
  try {
    assert.ok(options);
    assert.ok(options.operatingDate);
    assert.ok(options.institution)
  } catch(e) {
    return callback(e);
  }
  var Contract = this;
  var contracts = 0;
  var ContractStream = Contract.find({
    institution: ensureId(options, "institution"),
    status: "active"
  }).stream().on("data", function(contract) {
    var _stream = this;
    if (contract.closeOperatingDate instanceof Function) {
      _stream.pause();
      contract.closeOperatingDate(options, function (err) {
        if (!err) contracts++;
        toLog(err, contract);
        _stream.resume();
      });
    }
  }).on("error", function(err) {
    return callback(err);
  }).on("close", done);

  function done() {
    return callback(null, {contracts: contracts});
  }

  function toLog(err, doc) {
    if (err) {
      return console.error(err);
    }
    return console.log("date closed for %s: %s", doc.__t, doc._id);
  }
}

ContractSchema.statics.openOperatingDate = function (options, callback) {
  try {
    assert.ok(options);
    assert.ok(options.operatingDate);
    assert.ok(options.institution)
  } catch(e) {
    return callback(e);
  }
  var Contract = this;
  var contracts = 0;
  var ContractStream = Contract.find({
    institution: ensureId(options, "institution"),
    status: "active"
  }).stream(
  ).on("data", function(contract) {
    if (contract.openOperatingDate instanceof Function) {
      contract.openOperatingDate(options, function (err) {
        if (!err) contracts++;
        toLog(err, contract);
      });
    }
  }).on("error", function(err) {
    return callback(err);
  }).on("close", done);

  function done() {
    return callback(null, {contracts: contracts});
  }

  function toLog(err, doc) {
    if (err) {
      return console.error(err);
    }
    return console.log("date opened for %s: %s", doc.__t, doc._id);
  }
}

var Contract = mongoose.model("Contract", ContractSchema);

module.exports = exports = {
  Contract: Contract
}
