var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var contractStatuses = ["new", "active", "closed"];
var ContractSchema = new Schema({
  institution: {type: Schema.Types.ObjectId, ref: "Institution", required: true},
  number: String,
  legalDate: {type: Date, required: true, default: Date.now},
  status: {type: String, enum: contractStatuses, required: true, default: contractStatuses[0]},
  contractor: {type: Schema.Types.ObjectId, required: true, ref: "Entity"},
  accounts: {
    gateway: {type: String, required: false, ref: "Account"}
  }


});
