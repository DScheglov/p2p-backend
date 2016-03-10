var assert = require('assert');
var settlements = require('../models/tools/settlements');

var period = {
  start: new Date('2016-02-02'),
  end: new Date('2016-03-01')
};

settlements.nextPeriod.call(period);
console.dir(period);
assert.equal(period.start.toISOString(), (new Date('2016-03-02')).toISOString());
assert.equal(period.end.toISOString(), (new Date('2016-04-01')).toISOString());
