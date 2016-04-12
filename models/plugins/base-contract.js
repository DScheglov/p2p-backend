var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var assert = require("assert");

module.exports = exports = baseContract;

function baseContract(schema, options) {
  options = options || {};
  options.ref = options.ref || "Contract";
  if (typeof(options.required) === "undefined") {
    options.required = true;
  } else {
    options.required = !!options.required;
  }
  options.type = Schema.Types.ObjectId;
  schema.add({
    baseContract: options,
    contract: [{type: Schema.Types.ObjectId, ref: "Contract", required: false}]
  });
  schema.path("baseContract").set(function (c) {
    this.settlementPeriod = c.settlementPeriod.toObject();
    return c;
  });
  schema.path("contract").get(function () {
    var bcid = this.baseContract;
    bcid = bcid._id || bcid;
    if (this.contracts.indexOf(bcid) <0) this.contracts.push(bcid);
    return this.contracts;
  });

};
