var mongoose = require("mongoose");
var schema = mongoose.Schema;

var policySchema = new Schema({
  code: {type: String, required: true, unique: true},
  factories: {
    institution: {
      incomes: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"},
      expences: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"},
      current: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"},
    },
    entity: {
      legalEntity: {
        incomes: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"},
        expences: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"},
        current: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"},
        payables: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"},
        receivalbles: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"}
      },
      privateIndividual: {
        incomes: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"},
        expences: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"},
        current: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"},
        payables: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"},
        receivalbles: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"}
      }
    },
    contract: {
        gateway: {type: Schema.Types.ObjectId, required: false, ref: "AccountFactory"}
    }
  }
});

var AccountingPolicy = mongoose.model("AccountingPolicy", policySchema);
module.exports = exports = {
  AccountingPolicy: AccountingPolicy
};
