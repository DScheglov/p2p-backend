var mongoose = require("mongoose");
var log = require("../lib/logger")(module);

var Schema = mongoose.Schema;

var individualEntitySchema = new Schema({
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
		number: String
	},
	email: [String],
	phone: [String],
	skype: [String]
});

var legalEntitySchema = new Schema({
	officialTitle: String,
	director: { type: Schema.Types.ObjectId, ref: 'Subject' },
	manager: {type: Schema.Types.ObjectId, ref: 'Subject'}
});

var subjectSchema = new Schema({
	title: {type: String, required: true},
	code: {type: String, required: true},
	updated: {type: Date, 'default': Date.now},
	entityType: {
		type: String,
		enum: ['individual', 'legal']
	},
	individual: individualEntitySchema,
	legal: legalEntitySchema,
	comments: [{
		author: String,
		dateTime: {type:Date, 'default': Date.now},
		text: String
	}],
	attachments: [{
		title: String,
		path: String
	}]
});

subjectSchema.index({code: 1});
subjectSchema.index({entityType: 1});
subjectSchema.index({title: 1});
subjectSchema.index({updated: -1});

subjectSchema.methods.addComment = function (obj, callback) {
	if (obj.text) {
		this.comments.push({
			text: obj.text,
			author: obj.author || "incognito"
		});
		this.save(function (err, subj) {
			if (err) next(err);
			return callback(null, subj.comments.pop());
		});
	} else {
		callback(new Error("No data to append as a comment"));
	}
};

var Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;