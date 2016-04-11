var async = require("async");
var assert = require('assert');
var mongoose = require('mongoose');
var models = require('../../../models/models');
var fixtures = {
  institutions: require('../../fixtures/institutions'),
  entities: require('../../fixtures/entities'),
  accounts: require('../../fixtures/accounts'),
  factories: require('../../fixtures/factories'),
  policies: require('../../fixtures/product-policies'),
  products: require('../../fixtures/products'),
  contracts: require('../../fixtures/contracts')
}

describe("models.currentAccountContract", function (done) {

  before(function (done) {
    var dbName = "temp_db_"+mongoose.Types.ObjectId().toString();
    mongoose.connect('mongodb://localhost/'+dbName);
    var iCollection = models.Institution.collection;
    var eCollection = models.Entity.collection;
    var prCollection= models.Product.collection;
    var aCollection = models.Account.collection;
    var fCollection = models.AccountFactory.collection;
    var pCollection = models.AccountingProductPolicy.collection;
    var cCollection = models.Contract.collection;
    async.series([
      iCollection.insert.bind(iCollection, fixtures.institutions),
      eCollection.insert.bind(eCollection, fixtures.entities),
      fCollection.insert.bind(fCollection, fixtures.factories),
      pCollection.insert.bind(pCollection, fixtures.policies),
      prCollection.insert.bind(prCollection, fixtures.products),
      aCollection.insert.bind(aCollection, fixtures.accounts),
      cCollection.insert.bind(cCollection, fixtures.contracts)
    ], function (err) {
      models.AccountFactory.update({}, {
        $set: {sequence: fixtures.accounts.length + 1}
      }, {multi: true}, done);
    });
  });

  it("should be created", function(done) {
    var caContract = new (models.currentAccountContract)({
      institution: fixtures.entities[0].institution,
      owner: fixtures.entities[0]._id,
      productCode: fixtures.products[2].code
    });
    caContract.save(function(err, _self) {
      assert.ok(!err, "Error occured: " + (err&&err.message));
      assert.ok(_self);
      assert.equal(_self, caContract);
      done();
    });
  });

  after(function (done) {
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close(done);
  });
})
