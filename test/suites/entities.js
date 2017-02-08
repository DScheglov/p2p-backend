var async = require("async")
var assert = require('assert');
var mongoose = require('../../mongoose')
var entities = require('../../models/entities');
var Entity = entities.Entity;
var PrivateIndividual = entities.PrivateIndividual;
var LegalEntity = entities.LegalEntity;
var Institution = require('../../models/institutions').Institution;
var fixtures = {
  institutions: require('../fixtures/institutions'),
  entities: require('../fixtures/entities')
}

describe("models.Entity", function (done) {

  before(function (done) {
    var dbName = "temp_db_" + mongoose.Types.ObjectId().toString();
    mongoose.connect('mongodb://localhost/'+dbName);
    var iCollection = Institution.collection;
    var eCollection = Entity.collection;
    require("../../models/accounting-policies");
    async.series([
      iCollection.insert.bind(iCollection, fixtures.institutions),
      eCollection.insert.bind(eCollection, fixtures.entities)
    ], done)
  });

  describe("models.PrivateIndividual", function () {
    it("should be created", function(done) {
      var PI = new PrivateIndividual({
        "title" : "John Smith",
        "code" : "1112223334",
        "birthday" : "1980-01-01",
        "institution" : fixtures.institutions[0]._id,
        "idDocument" : {
          "type" : "passport",
          "number" : "PP 012210",
          "issuranceDate" : "1996-02-01"
        },
        "name" : {
          "first" : "Petro",
          "middle" : "P.",
          "last" : "Petrov"
        }
      });
      PI.save(function(err, _self) {
        assert.ok(!err, "Error occured while creating a PrivateIndividual " + (err&&err.message));
        assert.ok(_self, "PrivateIndividual was not created");
        assert.equal(_self, PI);
        assert.ok(_self instanceof Entity, "Created instance is not one of Entity class");
        done();
      })
    });

    it("creation should fail if institution is not specified", function(done) {
      var PI = new PrivateIndividual({
        "title" : "John Smith",
        "code" : "4442221110",
        "birthday" : "1980-01-01",
        "idDocument" : {
          "type" : "passport",
          "number" : "PP 012210",
          "issuranceDate" : "1996-02-01"
        },
        "name" : {
          "first" : "Petro",
          "middle" : "P.",
          "last" : "Petrov"
        }
      });
      PI.save(function (err, _self) {
        assert.ok(err);
        assert.ok(!_self);
        assert.ok(err.errors.institution);
        done();
      });
    });

    it("should find only PrivateIndividual's", function(done) {
      PrivateIndividual.find({}, function(err, list) {
        assert.ok(!err, "Error occured while searching for PrivateIndividual's: "+(err&&err.message));
        assert.ok(list);
        assert.ok(list.length);
        for (var i=0; i<list.length; i++) {
          assert.ok(list[i] instanceof PrivateIndividual);
        }
        done();
      });
    });

  });


  describe("models.LegalEntity", function () {
    it("should be created", function(done) {
      var LE = new LegalEntity({
        "title" : "Apple Computers",
        "code" : "777-666-555-111",
        "institution" : "56d481db3a4c513a1addd11a"
      });
      LE.save(function(err, _self) {
        assert.ok(!err, "Error occured while creating a LegalEntity " + (err&&err.message));
        assert.ok(_self, "LegalEntity was not created");
        assert.equal(_self, LE);
        assert.ok(_self instanceof Entity, "Created instance is not one of Entity class");
        done();
      })
    });

    it("creation should fail if institution is not specified", function(done) {
      var LE = new LegalEntity({
        "title" : "Apple Computers",
        "code" : "777-666-555-111"
      });
      LE.save(function (err, _self) {
        assert.ok(err);
        assert.ok(!_self);
        assert.ok(err.errors.institution);
        done();
      });
    });

    it("should find only LegalEntities", function(done) {
      LegalEntity.find({}, function(err, list) {
        assert.ok(!err, "Error occured while searching for LegalEntities: "+(err&&err.message));
        assert.ok(list);
        assert.ok(list.length);
        for (var i=0; i<list.length; i++) {
          assert.ok(list[i] instanceof LegalEntity);
        }
        done();
      });
    });

  });

  it("should find entities of both type: PrivateIndividual & LegalEntities", function(done) {
    Entity.find({}, function(err, list) {
      assert.ok(!err, "Error occured while searching for LegalEntities: "+(err&&err.message));
      assert.ok(list);
      assert.ok(list.length);
      var piFound = false;
      var leFound = false;
      var isPI, isLE;
      for (var i=0; i<list.length; i++) {
        isPI = list[i] instanceof PrivateIndividual;
        isLE = list[i] instanceof LegalEntity;
        piFound = piFound || isPI;
        leFound = leFound || isLE;
        assert.ok(isPI || isLE);
      }
      assert.ok(piFound);
      assert.ok(leFound);
      done();
    });
  });

  after(function (done) {
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close(done);
  });
})
