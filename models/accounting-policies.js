var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var policySchema = new Schema({
  title: {type: String, required: true},
  description: String,
  institution : {type: Schema.Types.ObjectId, ref: "institution", required: true},
  factories: {
    institution: {
      incomes: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"},
      expenses: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"},
      current: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"},
    },
    legalEntity: {
      payables: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"},
      receivalbles: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"}
    },
    privateIndividual: {
      current: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"}
    },
    contract: {
      gateway: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"}
    }
  }
});
policySchema.index({"institution": true});

var AccountingPolicy = mongoose.model("AccountingPolicy", policySchema);
module.exports = exports = {
  AccountingPolicy: AccountingPolicy
};
