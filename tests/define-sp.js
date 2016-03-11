var assert = require('assert');
var settlements = require("../models/tools/settlements");
var defineSP = settlements.define;

var SP = defineSP({
  operatingDate: "2016-03-12",
  settlementDayOfMonth: 10
});

console.dir(SP);
assert.equal(SP.start.toISOString(), (new Date("2016-03-12")).toISOString());
assert.equal(SP.end.toISOString(), (new Date("2016-04-09")).toISOString());
console.dir(SP);
