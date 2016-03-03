var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ensureAccounts = require("./tools/ensure-accounts");

var entitySchema = new Schema({
  title: {type: String, required: true},
  code: {type: String, required: true},
  updated: {type: Date, 'default': Date.now},
  comments: [{
    author: String,
    dateTime: {type:Date, 'default': Date.now},
    text: String
  }],
  attachments: [{
    title: String,
    path: String
  }],
  institution: {type: Schema.Types.ObjectId, ref: "Institution", required: true}
});

entitySchema.index({institution: 1});
entitySchema.index({code: 1});
entitySchema.index({title: 1});
entitySchema.index({updated: -1});


var privateIndividualSchema = new Schema({
  name: {
    first: {type: String, required: true},
    last: {type: String, required: true},
    middle: String
  },
  birthday: {type: Date, required: true},
  idDocument: {
    type: {
      type: String,
      enum: ['passport', 'driver license'],
      required: true
    },
    number: String,
    issuranceDate: Date,
    issuredBy: String
  },
  email: [String],
  phone: [String],
  skype: [String],
  accounts : {
    current: {type: String, required: false, ref: "Account"}
  }
});
privateIndividualSchema.plugin(ensureAccounts, {subject: "privateIndividual"});
privateIndividualSchema.index({"idDocument.number": 1, sparse: true});
privateIndividualSchema.index({"email": 1, sparse: true});
privateIndividualSchema.index({"phone": 1, sparse: true});
privateIndividualSchema.index({"skype": 1, sparse: true});

var legalEntitySchema = new Schema({
  officialTitle: String,
  officialAddress: String,
  director: { type: Schema.Types.ObjectId, ref: 'Entity' },
  manager: {type: Schema.Types.ObjectId, ref: 'Entity'},
  accounts : {
    payables: {type: String, required: false, ref: "Account"},
    receivables: {type: String, required: false, ref: "Account"}
  }
});
legalEntitySchema.plugin(ensureAccounts, {subject: "legalEntity"});

var Entity = mongoose.model("Entity", entitySchema);
var privateIndividual = Entity.discriminator("PrivateIndividual", privateIndividualSchema);
var legalEntity = Entity.discriminator("LegalEntity", legalEntitySchema);

module.exports = exports = {
  Entity: Entity,
  privateIndividual: privateIndividual,
  legalEntity: legalEntity
};
