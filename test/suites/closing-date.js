var async = require("async");
var assert = require('assert');
var mongoose = require('mongoose');
var models = require('../../models/models');
var fixtures = {
  institutions: require('../fixtures/institutions'),
  entities: require('../fixtures/entities'),
  accounts: require('../fixtures/accounts'),
  factories: require('../fixtures/factories'),
  policies: require('../fixtures/product-policies'),
  products: require('../fixtures/products'),
  contracts: require('../fixtures/contracts')
}

describe("Institution.closeOperatingDate", function (done) {

  before(function (done) {
    var dbName = "temp_db_"+mongoose.Types.ObjectId().toString();
    mongoose.connect('mongodb://localhost/'+dbName);
    var iCollection = models.Institution.collection;
    var eCollection = models.Entity.collection;
    var prCollection= models.Product.collection;
    var aCollection = models.Account.collection;
    var cCollection = models.Contract.collection;
    var fCollection = models.AccountFactory.collection;
    var pCollection = models.AccountingProductPolicy.collection;
    async.series([
      iCollection.insert.bind(iCollection, fixtures.institutions),
      eCollection.insert.bind(eCollection, fixtures.entities),
      fCollection.insert.bind(fCollection, fixtures.factories),
      pCollection.insert.bind(pCollection, fixtures.policies),
      prCollection.insert.bind(prCollection, fixtures.products),
      aCollection.insert.bind(aCollection, fixtures.accounts),
      cCollection.insert.bind(cCollection, fixtures.contracts)
    ],function (err) {
      models.AccountFactory.update({}, {
        $set: {sequence: fixtures.accounts.length + 1}
      }, {multi: true}, done);
    });
  });

  it("should process close date operations", function(done) {
    var institution;
    var expClosedDate = new Date(fixtures.institutions[0].operatingDate);
    async.waterfall([
      models.Institution.findById.bind(
        models.Institution,
        fixtures.institutions[0]._id
      ),
      function(_institution) {
        institution = _institution;
        assert.ok(institution);
        var next = arguments[arguments.length-1];
        institution.closeOperatingDate({}, next)
      }
    ], function (err, results) {
      assert.ok(!err, "Error occured: " + (err&&err.message));
      assert.ok(results);
      // 3 - the nuber of CurrentAccountContracts in the fixtures
      assert.equal(results.contracts, 3);
      assert.equal(results.accounts, fixtures.accounts.length + 1); // account of Interests for one of the contracts
      assert.ok(institution.closedOperatingDate);
      assert.equal(institution.closedOperatingDate.toISOString(), expClosedDate.toISOString());
      assert.ok(!institution.operatingDate);
      done();
    });
  });

  after(function (done) {
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close(done);
  });
})
