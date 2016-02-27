var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ActiveInactive = ['inactive', 'active'];

var InstitutionSchema = new Schema({
	title: {type: String, required: true},
	country: {type: String, required: true},
	code: {type: String, required: true},
	status: {type: String, enum: ActiveInactive, default: ActiveInactive[0], required: true},
	accounts : {
		incomes: {type: String, required: false, ref: "Account"},
		expences: {type: String, required: false, ref: "Account"},
		current: {type: String, required: false, ref: "Account"}
	}

});

InstitutionSchema.index({"country": 1});
InstitutionSchema.index({"code": 1});
InstitutionSchema.index({"status": 1});

var Institution = mongoose.model("Institution", InstitutionSchema);

module.exports = exports = {
	Institution: Institution
};
