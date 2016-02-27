'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TOPIC_TYPES = ['theoretical', 'practical', 'mixed'];

var TopicSchema = new Schema({
	order: {type: Number, required: true, index: true},
	type : {type: String, required: true, enum: TOPIC_TYPES, index: true},
	title: {type: String, required: true, index: true},
	lessons: {type: Number, required: true, 'default': 1}
});

var DisciplineSchema = new Schema({
	order: {type: Number, required: true, index: true},
	type : {type: String, required: true, enum: TOPIC_TYPES, index: true},
	title: {type: String, required: true, index: true},
	topics: [TopicSchema],
	isActive: {type: Boolean, required: true, 'default': false, index: true}
});

module.exports = {
	Discipline: mongoose.model("Discipline", DisciplineSchema)
};

