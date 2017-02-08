'use strict';

var twig = require("twig");
var mongoose = require('../mongoose');
var Schema = mongoose.Schema;
var ensureId = require('./tools/ensure').id;
var accountTypes = require('./accounts').accountTypes;

var accountFactorySchema = new Schema({
  institution: {type: Schema.Types.ObjectId, ref: "Institution", required: true},
  code: {type: String, required: true},
  title: String,
  accountTitle: {type: String, required: true},
  GLNumber: String,
  institutionCode: String,
  prefix: String,
  sufix: String,
  template: String,
  isPersonal: {type: Boolean, default: true},
  accountType: {type: String, enum: accountTypes, required: true},
  currency: {type: String, required: true},
  sequence: {type: Number, required: true, default: 0}
});

accountFactorySchema.index({institution: 1});
accountFactorySchema.index({code: 1});
accountFactorySchema.index({institution: 1, code: 1}, {unique: true});
accountFactorySchema.index({GLNumber: 1});
accountFactorySchema.index({accountType: 1});
accountFactorySchema.index({currency: 1});

accountFactorySchema.pre("save", preSave);
accountFactorySchema.statics.next = getNext;
accountFactorySchema.statics.openAccount = factory_openAccount;
accountFactorySchema.methods.generate = generate;

// ======================================================================== //
// Interface
//

module.exports = exports = {
  AccountFactory: mongoose.model("AccountFactory", accountFactorySchema)
};

// ======================================================================== //
// Implementation
//

function preSave(next) {
  var Institution = mongoose.model('Institution');
  var self = this;
  return Institution.findById(ensureId(this, 'institution'), function(err, inst) {
    if (err) return next(err);
    if (!inst) return next(
      new Error("Institution ["+self.institution+"] is not found.")
    );
    self.institutionCode = inst.code;
    next();
  });
}

function getNext(factory, cb) {
  return (this
    .findOneAndUpdate({_id: factory}, {$inc: {sequence: 1}}, {new: true})
    .exec(cb)
  );
}

function factory_openAccount(options, cb) {
  var theFactory = options.factory; delete options.factory;

  return this.next(theFactory, function (err, factory) {
    if (err) return cb(err, null);
    if (!factory) {
      return cb(new Error("Factory ['"+theFactory+"'] is not found."))
    }
    openAccount(factory, options, cb);
  });
}

function buildConrtoll() {
  var s = "";
  for (var i=0;i<arguments.length; i++) s += arguments[i];
  var C = 0;
  for (i=0;i<s.length;i++) C += parseInt(s.charAt(i), 10);
  return C % 10;
}

function openAccount(factory, options, cb) {
  var Entity = mongoose.model('Entity');
  var Account = mongoose.model('Account');
  var accountParams = {};

  if (factory.isPersonal && !options.owner) return cb(
    new Error("Account ["+factory.code+"] must be personal. Please specify owner."),
    null
  );


  if (options.owner && !options.owner._id) {
    return Entity.findById(options.owner, function (err, owner) {
      if (err) return cb(err, null);
      if (!owner) return cb(
        new Error("Specified owner ["+options.owner+"] couldn't be found."),
        null
      );
      options.owner = owner;
      return openAccount(factory, options, cb);
    });
  }
  accountParams.number = factory.generate(options);
  accountParams.title = options.title || factory.accountTitle;
  accountParams.type =  factory.accountType;
  accountParams.GLNumber = options.GLNumber || factory.GLNumber;
  accountParams.currency = factory.currency;
  accountParams.institution = ensureId(factory, 'institution');
  accountParams.owner = ensureId(options, 'owner') || null;
  accountParams.status = options.status || null;
  var account = new Account(accountParams);
  return account.save(cb);
}

function generate(options) {
  var tS = this.template || "{{institution}}:{{prefix|wide(4)}}{{controll}}{{sequence|wide(-9)}}{{sufix}}-{{GLNumber}}.{{currency|upper}}";
  var tmpl = twig.twig({data: tS});
  return tmpl.render({
    prefix: this.prefix,
    sufix: this.sufix,
    institution: this.institutionCode,
    owner: options.owner && options.owner.code,
    GLNumber: this.GLNumber,
    currency: this.currency,
    sequence: this.sequence,
    controll: buildConrtoll(this.prefix, this.sequence, this.sufix)
  });
};

twig.extendFilter("wide", function (value, width, filler) {
  var s = "" + value;
  var left = width > 0;
  width = Math.abs(width);
  filler = (new Array(width - s.length + 1)).join(filler || "0");

  if (left) return s + filler;
  return filler + s;
});
