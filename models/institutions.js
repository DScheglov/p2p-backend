var assert = require('assert');
var utils = require('util');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var log = require('../lib/logger')(module);

var ActiveInactive = ['inactive', 'active'];

var InstitutionSchema = new Schema({
  title: {type: String, required: true},
  country: {type: String, required: true},
  code: {type: String, required: true},
  status: {type: String, enum: ActiveInactive, default: ActiveInactive[0], required: true},
  operatingDate: {type: Date, required: false},
  closedOperatingDate: {type: Date, required: false}
});
InstitutionSchema.index({"country": 1});
InstitutionSchema.index({"code": 1}, {"unique": true});
InstitutionSchema.index({"status": 1});

InstitutionSchema.methods.closeOperatingDate = closeOperatingDate;
InstitutionSchema.methods.openOperatingDate = openOperatingDate;

// ======================================================================== //
// Interface
//

module.exports = exports = {
  Institution: mongoose.model("Institution", InstitutionSchema)
};

// ======================================================================== //
// Implementation
//

function closeOperatingDate(options, callback) {
  var self = this;
  var totals = {};

  var options = {
    institution: self._id,
    operatingDate: self.operatingDate
  };

  mongoose.model("Contract").closeOperatingDate(options, function(err, res) {
    if (err) return callback(err);
    log.info(res);
    utils._extend(totals, res);
    closeForAccounts();
  });

  function closeForAccounts() {
    mongoose.model("Account").closeOperatingDate(options, function(err, res) {
      if (err) return callback(err);
      log.info(res);
      utils._extend(totals, res);
      done();
    });
  }

  function done() {
    self.closedOperatingDate = self.operatingDate;
    self.operatingDate = null;
    self.save(function(err, _self) {
      totals.institution = _self;
      return callback(err, totals);
    });
  }

}

function openOperatingDate(options, callback) {
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
      log.info(res);
      res.institution = _self;
      callback(null, res);
    });
  });

}
