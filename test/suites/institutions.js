var assert = require('assert');
var mongoose = require('mongoose');
var Institution = require('../../models/institutions').Institution;
var fixtures = require('../fixtures/institutions');

describe("models.Institution", function (done) {


  before(function (done) {
    var dbName = "temp_db_"+mongoose.Types.ObjectId().toString();
    mongoose.connect('mongodb://localhost/'+dbName);
    Institution.collection.insert(fixtures, done);
  });

  it("should be created", function(done) {
    var institution = new Institution({
      code: "SOME-CODE",
      title:"Just Institution",
      country: "USA",
      status: "active",
      operatingDate: '2016-01-01'
    });
    institution.save(function (err, _self) {
      assert.ok(!err);
      assert.equal(_self, institution);
      done();
    })
  });

  it("should be found by code", function(done) {
    Institution.find({code: fixtures[0].code}, function(err, list) {
      assert.ok(!err);
      assert.ok(list);
      assert.ok(list.length);
      assert.equal(list[0].code, fixtures[0].code);
      done();
    })
  });

  after(function (done) {
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close(done);
  });
})
