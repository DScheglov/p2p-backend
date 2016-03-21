var assert = require('assert');
var utils = require('util');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ensureAccounts = require('./tools/ensure-accounts');

var ActiveInactive = ['inactive', 'active'];

var InstitutionSchema = new Schema({
  title: {type: String, required: true},
  country: {type: String, required: true},
  code: {type: String, required: true},
  status: {type: String, enum: ActiveInactive, default: ActiveInactive[0], required: true},
  accounts : {
    incomes: {type: String, required: false, ref: "Account"},
    expenses: {type: String, required: false, ref: "Account"},
    current: {type: String, required: false, ref: "Account"}
  },
  accountingPolicy: {type: Schema.Types.ObjectId, required: false, ref: "AccountingPolicy"},
  operatingDate: {type: Date, required: false},
  closedOperatingDate: {type: Date, required: false}
});
InstitutionSchema.index({"country": 1});
InstitutionSchema.index({"code": 1}, {"unique": true});
InstitutionSchema.index({"status": 1});

InstitutionSchema.methods.closeOperatingDate = function(options, callback) {
  var self = this;
  var contractsProcessed = false;
  var accountsProcessed = false;
  var totals = {};

  var options = {
    institution: self._id,
    operatingDate: self.operatingDate
  };

  mongoose.model("Contract").closeOperatingDate(options, function(err, res) {
    if (err) return callback(err);
    contractsProcessed = true;
    console.dir(res);
    utils._extend(totals, res);
    closeForAccounts();
  });

  function closeForAccounts() {
    mongoose.model("Account").closeOperatingDate(options, function(err, res) {
      if (err) return callback(err);
      accountsProcessed = true;
      console.dir(res);
      utils._extend(totals, res);
      done();
    });
  }

  function done() {
    if (contractsProcessed && accountsProcessed) {
      self.closedOperatingDate = self.operatingDate;
      self.operatingDate = null;
      self.save(function(err, _self) {
        totals.institution = _self;
        return callback(err, totals);
      });
    }
  }

}

InstitutionSchema.methods.openOperatingDate = function(options, callback) {
  try {
    assert.ok(this.closedOperatingDate, "You have to close current date");
    assert.ok(!this.operatingDate, "You have to close current date");
  } catch(e) {
    return callback(e);
  }
  var self = this;
  var contractsProcessed = false;
  var newOD = new Date(self.closedOperatingDate);
  newOD.setDate(newOD.getDate()+1);
  self.operatingDate = newOD;
  var options = {
    operatingDate: self.operatingDate,
    institution: self._id
  }

  return self.save(function(err, _self) {
    if (err) return callback(err);
    mongoose.model("Contract").openOperatingDate(options, function(err, res) {
      if (err) return callback(err);
      contractsProcessed = true;
      console.dir(res);
      res.institution = _self;
      callback(null, res);
    });
  });

}


var Institution = mongoose.model("Institution", InstitutionSchema);

module.exports = exports = {
  Institution: Institution
};
