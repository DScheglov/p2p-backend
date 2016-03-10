var assert = require("assert");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SettlementPeriodSchema = new Schema({
  start: {type: Date, required: true},
  end: {type: Date, required: true}
}, {_id: false});

 function define(options) {
  assert.ok(options, "Specify options");
  assert.ok(options.settlementDayOfMonth, "Specify settlementDayOfMonth in options");
  assert.ok(options.operatingDate, "Specify operatingDate in options");

  var OD = new Date(options.operatingDate);
  var start = OD;
  var nextMonth = OD.getDate() > options.settlementDayOfMonth ? 1 : 0;
  var end = new Date(
    OD.getFullYear(),
    OD.getMonth() + nextMonth,
    options.settlementDayOfMonth - 1
  );
  return {start: start, end: end};
}

function nextPeriod() {
  var start = new Date(this.end);
  start.setUTCDate(start.getUTCDate() + 1);
  var end = new Date(start);
  end.setUTCMonth(end.getUTCMonth()+1);
  end.setUTCDate(end.getUTCDate()-1);
  this.start = start;
  this.end = end;
  return this;
}

module.exports = exports = {
  SettlementPeriodSchema: SettlementPeriodSchema,
  nextPeriod: nextPeriod,
  define: define
}
