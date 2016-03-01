
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
  accountingPolicy: {type: Schema.Types.ObjectId, required: false, ref: "AccountingPolicy"}
});
InstitutionSchema.index({"country": 1});
InstitutionSchema.index({"code": 1}, {"unique": true});
InstitutionSchema.index({"status": 1});

var Institution = mongoose.model("Institution", InstitutionSchema);

module.exports = exports = {
  Institution: Institution
};
