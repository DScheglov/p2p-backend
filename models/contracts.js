var async = require("async");
var assert = require("assert");
var mongoose = require("mongoose"); require('../lib/schema-ondo');
var Schema = mongoose.Schema;

var ProductSchema = require("./products").Product.schema.options;
var settlements = require("./tools/settlements");
var SettlementPeriodSchema = settlements.SettlementPeriodSchema;
var defineSP = settlements.define;
var ensureId = require("./tools/ensure").id;
var ensureCallback = require("./tools/ensure").callback;
var statusHistory = require("./plugins/status-history");
var log = require("../lib/logger")(module);

var contractStatuses = ["new", "active", "closed"];
var ContractSchema = new Schema({
  institution: {type: Schema.Types.ObjectId, ref: "Institution", required: true},
  legalNumber: String,
  legalDate: {type: Date, required: false},
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
ContractSchema.plugin(statusHistory, {statusList: contractStatuses});

ContractSchema.index({"institution": 1});
ContractSchema.index({"productCode": 1});
ContractSchema.index({"owner": 1});
ContractSchema.index({"legalNumber": 1}, {sparse: true});
ContractSchema.index({"legalDate": 1}, {sparse: true})

ContractSchema.pre("validate", preValidate);
ContractSchema.pre("save", preSave);

ContractSchema.methods.closeOperatingDate = closeOperatingDate;
ContractSchema.methods.openOperatingDate = openOperatingDate;
ContractSchema.statics.closeOperatingDate = closeOperatingDateForAll;
ContractSchema.statics.openOperatingDate = openOperatingDateForAll;

var Contract = mongoose.model("Contract", ContractSchema);

// ======================================================================== //
// Interface
//

module.exports = exports = {
  Contract: Contract
}

// ======================================================================== //
// Implementation
//

function preValidate(next) {

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
}

function preSave(next) {
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

}

function closeOperatingDate(options, callback) {
  this.emitAsync("endOfDay", this, options, callback);
}

function openOperatingDate(options, callback) {
  try {
    assert.ok(options, "Specify options");
    assert.ok(options.operatingDate, "Specify new operatingDate in options");
  } catch(err) {
    if (typeof(callback) === 'function') return callback(err);
    throw err;
  }

  return async.waterfall([
    this.emitAsync.bind(this, "startOfDay", options),
    verifyStartOfPeriod.bind(this, options)
  ], callback);

  function verifyStartOfPeriod(options) {
    var next = ensureCallback.apply(null, arguments);
    if (+options.operatingDate > +this.settlementPeriod.end) {
      settlements.nextPeriod.call(this.settlementPeriod);
      this.save(function (err, _self) {
        if (err) {
          if (typeof(next) === 'function') return next(err);
          throw err;
        }
        this.emitAsync("startOfPeriod", _self, options, next);
      });
    } else next();
  }

}

function closeOperatingDateForAll(options, callback) {
  callback = ensureCallback.apply(null, arguments);
  try {
    assert.ok(options, "You should specify options");
    assert.ok(options.operatingDate, "You should specify closing operatingDate");
    assert.ok(options.institution, "You should specify institution");
  } catch(e) {
    callback = arguments[arguments.length - 1];
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
      return log.error(err);
    }
    return log.info("date closed for %s: %s", doc.__t || "void Contract", doc._id.toString());
  }
}

function openOperatingDateForAll(options, callback) {
  try {
    assert.ok(options, "You should specify options");
    assert.ok(options.operatingDate, "You should specify opening operatingDate");
    assert.ok(options.institution, "You should specify institution");
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
    var _stream = this;
    if (contract.openOperatingDate instanceof Function) {
      _stream.pause();
      contract.openOperatingDate(options, function (err) {
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
      return log.error(err);
    }
    return log.info("date opened for %s: %s", doc.__t || "void Contract", doc._id.toString());
  }
}
