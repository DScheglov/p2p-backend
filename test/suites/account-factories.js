var async = require("async")
var assert = require('assert');
var mongoose = require('../../mongoose')
var Entity = require('../../models/entities').Entity;
var Institution = require('../../models/institutions').Institution;
var Factory = require('../../models/account-factories').AccountFactory;
var Account = require('../../models/accounts').Account;
var fixtures = {
  institutions: require('../fixtures/institutions'),
  factories: require('../fixtures/factories'),
  entities: require('../fixtures/entities')
}

describe("models.AccountFactory", function (done) {

  before(function (done) {
    var dbName = "temp_db_" + mongoose.Types.ObjectId().toString();
    mongoose.connect('mongodb://localhost/'+dbName);
    var iCollection = Institution.collection;
    var fCollection = Factory.collection;
    var eCollection = Entity.collection;
    async.series([
      iCollection.insert.bind(iCollection, fixtures.institutions),
      fCollection.insert.bind(fCollection, fixtures.factories),
      eCollection.insert.bind(eCollection, fixtures.entities)
    ], done)
  });

  it("should be created", function(done) {
    var factory = new Factory({
      "code" : "ACCOUNT",
      "GLNumber" : "8000",
      "prefix" : "8000",
      "sufix" : "",
      "title" : "Factory for ACCOUNT",
      "accountTitle" : "ACCOUNT",
      "currency" : "EUR",
      "accountType" : "Assets",
      "institution" : fixtures.institutions[0]._id,
      "isPersonal" : false
    })
    factory.save(function(err, _self) {
      assert.ok(!err, "Error occured while Factory created: "+(err && err.message));
      assert.equal(factory, _self);
      done();
    });
  });

  it("should be found by code", function(done) {
    Factory.find({code: fixtures.factories[0].code}, function(err, list) {
      var eDescr = "Error occured while Factory was creating an acount: ";
      eDescr += (err && err.message) || "no error";
      assert.ok(!err, eDescr);
      assert.ok(list);
      assert.ok(list.length);
      assert.ok(list[0].code, fixtures.factories[0].code);
      done();
    });
  });

  it("should open a non-personal account", function(done) {
    var options = {
      institution: fixtures.institutions[0]._id,
      factory: fixtures.factories[0]._id,
      status: "open"
    }

    Factory.openAccount(options, function (err, account) {
      assert.ok(!err, "Error occured due the account creating: "+(err && err.message));
      assert.ok(account, "Account is not created");
      assert.equal(account._id, "001:70008000000001-7000.EUR");
      done();
    });
  });

  it("should open an account for Private Individual", function(done) {
    var options = {
      institution: fixtures.institutions[0]._id,
      factory: fixtures.factories[3]._id,
      status: "open",
      owner: fixtures.entities[0]._id
    }

    Factory.openAccount(options, function (err, account) {
      assert.ok(!err, "Error occured due the account creating: "+(err && err.message));
      assert.ok(account, "Account is not created");
      assert.equal(account._id, "001:26201000000001-2620.EUR");
      done();
    });
  });

  it("should open an account for Legal Entity", function(done) {

    Factory.findOne({code: "LE_CURRENT"}, openAccount);

    function openAccount(err, factory) {
      assert.ok(!err, "Error occured in attemp to find Factory: " + (err && err.message));
      assert.ok(factory, "Factory wasn't found by code 'LE_CURRENT'");
      var options = {
        institution: fixtures.institutions[0]._id,
        factory: factory._id,
        status: "open",
        owner: fixtures.entities[3]._id
      }

      Factory.openAccount(options, function (err, account) {
        assert.ok(!err, "Error occured due the account creating: "+(err && err.message));
        assert.ok(account, "Account is not created");
        assert.equal(account._id, "001:26009000000001-2600.EUR");
        done();
      });
    }

  });

  it("should fail to open a personal account if owner was not specified", function(done) {
    var options = {
      institution: fixtures.institutions[0]._id,
      factory: fixtures.factories[3]._id,
      status: "open"
    }

    Factory.openAccount(options, function (err, account) {
      assert.ok(err);
      assert.equal(err.message, "Account ["+fixtures.factories[3].code+"] must be personal. Please specify owner.")
      done();
    });
  });

  it("should fail to open a personal account if owner was specified incorrectly", function(done) {
    var anId = mongoose.Types.ObjectId();
    var options = {
      institution: fixtures.institutions[0]._id,
      factory: fixtures.factories[3]._id,
      status: "open",
      owner: anId
    }

    Factory.openAccount(options, function (err, account) {
      assert.ok(err);
      assert.equal(err.message, "Specified owner ["+anId+"] couldn't be found.")
      done();
    });
  });

  it("should generate an account number according to the custom template", function(done) {
    var factory = new Factory({
      "code" : "ACCOUNT",
      "GLNumber" : "8000",
      "prefix" : "8000",
      "sufix" : "",
      "title" : "Factory for ACCOUNT",
      "accountTitle" : "ACCOUNT",
      "currency" : "EUR",
      "accountType" : "Assets",
      "institution" : fixtures.institutions[0]._id,
      "isPersonal" : false,
      "template" : "{{institution}}-{{prefix}}-{{sequence}}-{{controll}}"
    })
    factory.save(function(err, _self) {
      assert.ok(!err, "Error occured while Factory created: "+(err && err.message));
      assert.equal(factory, _self);

      var options = {
        institution: fixtures.institutions[0]._id,
        factory: _self._id,
        status: "open"
      }

      Factory.openAccount(options, function (err, account) {
        assert.ok(!err, "Error occured due the account creating: "+(err && err.message));
        assert.ok(account, "Account is not created");
        assert.equal(account._id, "001-8000-1-9");
        done();
      });
    });
  });

  after(function (done) {
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close(done);
  });
})
