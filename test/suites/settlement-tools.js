var assert = require('assert');
var settlements = require("../../models/tools/settlements");
var defineSP = settlements.define;

describe("settlements.define", function (done) {

  it("should create a period", function (done) {
    var SP = defineSP({
      operatingDate: "2016-03-12",
      settlementDayOfMonth: 10
    });
    assert.equal(SP.start.toISOString(), (new Date("2016-03-12")).toISOString());
    assert.equal(SP.end.toISOString(), (new Date("2016-04-09")).toISOString());
    done();
  });

});

describe("settlements.nextPeriod", function () {

  it("should define correctly mext period", function (done) {
    var period = {
      start: new Date('2016-02-02'),
      end: new Date('2016-03-01')
    };

    settlements.nextPeriod.call(period);
    assert.equal(period.start.toISOString(), (new Date('2016-03-02')).toISOString());
    assert.equal(period.end.toISOString(), (new Date('2016-04-01')).toISOString());
    done();
  });

});
