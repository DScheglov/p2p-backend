
var utils = require("util");
var swig = require("swig");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var entities = require("./entities");


var accountTypes = ['Assets', 'Liability'];
var accountStatuses = ["preopen", "open", "frozen", "closed"];
var AccountSchema = Schema({
	_id: String,
	title: {type: String, required: true},
	type: {type: String, enum: accountTypes, required: true},
	GLNumber: String,
	debit: {type: Number, 'default': 0, required: true},
	credit: {type: Number, 'default': 0, required: true},
	currency: {type: String, required: true},
	status: {type: String, enum: accountStatuses, 'default': accountStatuses[0], required: true},
	_pendingDebit: [{type: Schema.Types.ObjectId, ref: "Transaction"}],
	_pendingCredit: [{type: Schema.Types.ObjectId, ref: "Transaction"}],
	institution: {type: Schema.Types.ObjectId, ref: "Institution", required: true},
	owner: {type: Schema.Types.ObjectId, ref: "Entity", required: false},
	dailyBalance: [{
		date : {type: Date, required: true, default: Date.now},
		credit: {type: Number, required: true, default: 0},
		debit: {type: Number, required: true, default: 0}
	}]
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
AccountSchema
	.virtual("number")
		.set(function(v) {
			this._id = v;
			return v;
		}).
		get(function() {
			return this._id;
		});
AccountSchema.virtual("balance").get(function() {
	var balance = this.debit - this.credit;
	return (this.type == "Active")?balance:-balance;

});

AccountSchema.index({type: 1});
AccountSchema.index({GLNumber: 1});
AccountSchema.index({owner: 1});
AccountSchema.index({institution: 1});
AccountSchema.index({currency: 1});
AccountSchema.index({status: 1});

var accountFactorySchema = new Schema({
	institution: {type: Schema.Types.ObjectId, ref: "Institution", required: false},
	code: {type: String, required: true},
	title: String,
	accountTitle: {type: String, required: true},
	GLNumber: String,
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

accountFactorySchema.statics.next = function (institution, factoryCode, cb) {
	var model = this;
	return (model
		.findOneAndUpdate({
			institution: institution,
			code: factoryCode}, {$inc: {sequence: 1}
		 })
		.populate("institution")
		.exec(cb)
	);
};

accountFactorySchema.statics.openAccount = function(options, cb) {
	var factoryCode = options.factoryCode; delete options.factoryCode;
	var institution = options.institution; delete options.institution;


	return this.next(institution, factoryCode, function (err, factory) {
		if (err) return cb(err, null);
		if (!factory) {
			return cb(new Error("Factory is not found."))
		}
		return openAccount(factory, options, cb);
	});
};

accountFactorySchema.methods.generate = function(options) {
	var tS = this.template || "{{institution}}:{{prefix}}{{sequence|wide(-8)}}{{sufix}}-{{GLNumber}}.{{currency|upper}}";
	var tmpl = swig.compile(tS);
	return tmpl(utils._extend({
		prefix: this.prefix,
		sufix: this.sufix,
		institution: this.institution.code,
		owner: options.owner,
		GLNumber: this.GLNumber,
		currency: this.currency,
		sequence: this.sequence
	}, options));
};


function openAccount(factory, options, cb) {
	var accountParams = utils._extend({}, options);
	if (factory.isPersonal && !options.owner) {
		return cb(new Error("Account ["+factory.code+"] must be personal. Please specify owner."), null);
	}
	if (options.owner && !utils.isObject(options.owner)) {
		return entities.Entity.findById(new Schema.Types.Id(options.owner), function (err, owner) {
			if (err) return cb(err, null);
			if (!owner) return cb(new Error("Specified owner ['+options.owner+'] couldn't be found."), null);
			options.owner = owner;
			return openAccount(factory, options);
		});
	}
	accountParams.number = factory.generate(options);
	accountParams.title = accountParams.title || factory.accountTitle;
	accountParams.type =  factory.accountType;
	accountParams.GLNumber = accountParams.GLNumber || factory.GLNumber;
	accountParams.currency = factory.currency;
	accountParams.institution = factory.institution;
	accountParams.owner = options.owner && options.owner.code || null;
	var account = new Account(accountParams);
	return account.save(cb);
}

var Account = mongoose.model("Account", AccountSchema);
var AccountFactory = mongoose.model("AccountFactory", accountFactorySchema);

module.exports = exports = {
	Account: Account,
	AccountFactory: AccountFactory
};

swig.setFilter("wide", function (value, width, filler) {
	var s = "" + value;
	var left = width > 0;
	width = Math.abs(width);
	filler = (new Array(width - s.length + 1)).join(filler || "0");

	if (left) return s + filler;
	return filler + s;

});
