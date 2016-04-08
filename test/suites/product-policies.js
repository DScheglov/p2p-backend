var async = require("async")
var assert = require('assert');
var mongoose = require('mongoose');
var Institution = require('../../models/institutions').Institution;
var Entity = require('../../models/entities').Entity;
var ProductPolicy = require('../../models/accounting-policies').AccountingProductPolicy;
var Factory = require('../../models/account-factories').AccountFactory;
var Account = require('../../models/accounts').Account;
var fixtures = {
  institutions: require('../fixtures/institutions'),
  factories: require('../fixtures/factories'),
  entities: require('../fixtures/entities'),
  policies: require('../fixtures/product-policies')
}


describe("models.AccountingProductPolicy", function (done) {

  before(function (done) {
    var dbName = "temp_db_" + mongoose.Types.ObjectId().toString();
    mongoose.connect('mongodb://localhost/'+dbName);
    var iCollection = Institution.collection;
    var fCollection = Factory.collection;
    var eCollection = Entity.collection;
    var pCollection = ProductPolicy.collection;
    async.series([
      iCollection.insert.bind(iCollection, fixtures.institutions),
      fCollection.insert.bind(fCollection, fixtures.factories),
      eCollection.insert.bind(eCollection, fixtures.entities),
      pCollection.insert.bind(pCollection, fixtures.policies)
    ], done)
  });

  it("should be created", function(done) {
    var policy = new ProductPolicy({
      "title" : "Accounting Policy for VOID contracts - 2",
      "description" : "...",
      "institution" : fixtures.institutions[0]._id,
      "factories": [
        {
          "accountName" : "gateway",
          "openOn" : "creation"
        }
      ]
    });

    async.waterfall([
      Factory.findOne.bind(Factory, {code: "VOID_GATEWAY"}),
      function(_f, next) {
        assert.ok(_f, "Factory is not found");
        policy.factories[0].factory = _f._id;
        next();
      },
      policy.save.bind(policy)
    ], function(err, _self) {
      if (err) console.dir(err);
      assert.ok(!err, "Error occured: " + (err&&err.message));
      assert.equal(_self, policy);
      done();
    });
  });

  describe(".ensureAccounts", function() {

    it("should open an account on event =creation=", function(done) {
      var contract = {
        owner: fixtures.entities[0]._id,
        accounts: {}
      };
      ProductPolicy.ensureAccounts(
        fixtures.policies[0]._id, contract, "creation",
        function(err, _c) {
          assert.ok(!err, "Error occured: "+(err&&err.message));
          assert.ok(_c);
          assert.equal(contract, _c);
          assert.ok(_c.accounts.gateway);
          assert.equal(_c.accounts.gateway.number, "001:37001000000001-3700.EUR");
          assert.equal(_c.accounts.gateway._id, "001:37001000000001-3700.EUR");
          assert.equal(Object.keys(_c.accounts).length, 1);
          done();
        }
      )
    });

    it("shouldn't open an account on event =acceptance=", function(done) {
      var contract = {
        owner: fixtures.entities[0]._id,
        accounts: {}
      };
      ProductPolicy.ensureAccounts(
        fixtures.policies[0]._id, contract, "acceptance",
        function(err, _c) {
          assert.ok(!err, "Error occured: "+(err&&err.message));
          assert.ok(_c);
          assert.equal(contract, _c);
          assert.ok(!_c.accounts.gateway);
          assert.equal(Object.keys(_c.accounts).length, 0);
          done();
        }
      )
    });

    it("shouldn't open an account on event =first-usage=", function(done) {
      var contract = {
        owner: fixtures.entities[0]._id,
        accounts: {}
      };
      ProductPolicy.ensureAccounts(
        fixtures.policies[0]._id, contract, "first-usage",
        function(err, _c) {
          assert.ok(!err, "Error occured: "+(err&&err.message));
          assert.ok(_c);
          assert.equal(contract, _c);
          assert.ok(!_c.accounts.gateway);
          assert.equal(Object.keys(_c.accounts).length, 0);
          done();
        }
      )
    });

    it("should open an account on event =acceptance=", function(done) {
      var contract = {
        owner: fixtures.entities[0]._id,
        accounts: {}
      };
      ProductPolicy.ensureAccounts(
        fixtures.policies[1]._id, contract, "acceptance",
        function(err, _c) {
          assert.ok(!err, "Error occured: "+(err&&err.message));
          assert.ok(_c);
          assert.equal(contract, _c);
          assert.ok(_c.accounts.holds);
          assert.equal(_c.accounts.holds.number, "001:26201000000001-2620.EUR");
          assert.equal(_c.accounts.holds._id, "001:26201000000001-2620.EUR");
          assert.equal(Object.keys(_c.accounts).length, 1);
          done();
        }
      )
    });

    it("should open an account on event =first-usage=", function(done) {
      var contract = {
        owner: fixtures.entities[0]._id,
        accounts: {}
      };
      ProductPolicy.ensureAccounts(
        fixtures.policies[1]._id, contract, "first-usage",
        function(err, _c) {
          assert.ok(!err, "Error occured: "+(err&&err.message));
          assert.ok(_c);
          assert.equal(contract, _c);
          assert.ok(_c.accounts.interests);
          assert.equal(_c.accounts.interests.number, "001:26289000000001-2628.EUR");
          assert.equal(_c.accounts.interests._id, "001:26289000000001-2628.EUR");
          assert.equal(Object.keys(_c.accounts).length, 1);
          done();
        }
      )
    });

    it("shouldn't open an account on event =creation= if account assigned", function(done) {
      var contract = {
        owner: fixtures.entities[0]._id,
        accounts: {
          gateway: "number:1"
        }
      };
      ProductPolicy.ensureAccounts(
        fixtures.policies[0]._id, contract, "creation",
        function(err, _c) {
          assert.ok(!err, "Error occured: "+(err&&err.message));
          assert.ok(_c);
          assert.equal(contract, _c);
          assert.ok(_c.accounts.gateway);
          assert.equal(_c.accounts.gateway, "number:1");
          assert.equal(Object.keys(_c.accounts).length, 1);
          done();
        }
      )
    });

    it("shouldn't open an account on event =acceptance= if account assigned", function(done) {
      var contract = {
        owner: fixtures.entities[0]._id,
        accounts: {
          holds: "number:2"
        }
      };
      ProductPolicy.ensureAccounts(
        fixtures.policies[1]._id, contract, "acceptance",
        function(err, _c) {
          assert.ok(!err, "Error occured: "+(err&&err.message));
          assert.ok(_c);
          assert.equal(contract, _c);
          assert.ok(_c.accounts.holds);
          assert.equal(_c.accounts.holds, "number:2");
          assert.equal(Object.keys(_c.accounts).length, 1);
          done();
        }
      )
    });

    it("shouldn't open an account on event =first-usage= if account assigned", function(done) {
      var contract = {
        owner: fixtures.entities[0]._id,
        accounts: {
          interests: "number:3"
        }
      };
      ProductPolicy.ensureAccounts(
        fixtures.policies[1]._id, contract, "first-usage",
        function(err, _c) {
          assert.ok(!err, "Error occured: "+(err&&err.message));
          assert.ok(_c);
          assert.equal(contract, _c);
          assert.ok(_c.accounts.interests);
          assert.equal(_c.accounts.interests, "number:3");
          assert.equal(Object.keys(_c.accounts).length, 1);
          done();
        }
      )
    });

    it("should open an account if it is specified explicitly", function(done) {
      var contract = {
        owner: fixtures.entities[0]._id,
        accounts: {}
      };
      ProductPolicy.ensureAccounts(
        fixtures.policies[1]._id, contract, ["current"],
        function(err, _c) {
          assert.ok(!err, "Error occured: "+(err&&err.message));
          assert.ok(_c);
          assert.equal(contract, _c);
          assert.ok(_c.accounts.current);
          assert.equal(_c.accounts.current.number, "001:29091000000001-2909.EUR");
          assert.equal(_c.accounts.current._id, "001:29091000000001-2909.EUR");
          assert.equal(Object.keys(_c.accounts).length, 1);
          done();
        }
      )
    });

    it("should open all accounts if they are specified explicitly", function(done) {
      var contract = {
        owner: fixtures.entities[0]._id,
        accounts: {}
      };
      ProductPolicy.ensureAccounts(
        fixtures.policies[2]._id, contract, ["interests", "holds", "current"],
        function(err, _c) {
          var numbers = ["001:26009000000001-2600.EUR", "001:26000000000002-2600.EUR"];
          assert.ok(!err, "Error occured: "+(err&&err.message));
          assert.ok(_c);
          assert.equal(contract, _c);
          assert.ok(_c.accounts.interests);
          assert.equal(_c.accounts.interests.number, "001:26087000000001-2608.EUR");
          assert.equal(_c.accounts.interests._id, "001:26087000000001-2608.EUR");
          assert.ok(_c.accounts.holds);
          assert.equal(_c.accounts.holds.number, _c.accounts.holds._id);
          assert.ok(numbers.indexOf(_c.accounts.holds.number)>=0);
          assert.ok(_c.accounts.current);
          assert.equal(_c.accounts.current.number, _c.accounts.current._id);
          assert.ok(numbers.indexOf(_c.accounts.current.number)>=0);
          assert.notEqual(_c.accounts.current.number, _c.accounts.holds.number);
          assert.equal(Object.keys(_c.accounts).length, 3);
          done();
        }
      )
    });

    it("should open new account and shouldn't open already assigned account", function(done) {

      var contract = {
        owner: fixtures.entities[0]._id,
        accounts: {
          interests: "number: 5"
        }
      };
      ProductPolicy.ensureAccounts(
        fixtures.policies[2]._id, contract, ["interests", "receivables"],
        function(err, _c) {
          assert.ok(!err, "Error occured: "+(err&&err.message));
          assert.ok(_c);
          assert.equal(contract, _c);
          assert.ok(_c.accounts.interests);
          assert.equal(_c.accounts.interests, "number: 5");
          assert.ok(_c.accounts.receivables);
          assert.equal(_c.accounts.receivables.number, "001:28090000000001-2809.EUR");
          assert.equal(_c.accounts.receivables._id, "001:28090000000001-2809.EUR");
          assert.equal(Object.keys(_c.accounts).length, 2);
          done();
        }
      )
    });

  });

  after(function (done) {
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close(done);
  });
})
