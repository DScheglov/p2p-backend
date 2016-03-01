var async = require('async');
var mongoose = require('mongoose');

var ensureId = require('./ensure-id');

module.exports = exports = function ensureAccounts(schema, options) {

  var accountsList = Object.keys(schema.tree.accounts);
  var subject = options.subject;
  if (!subject) throw new Error("ensureAccounts plugin - wrong usage - the subject of accounts is not specified.");

  schema.pre("save", function (next) {
    var Policy = mongoose.model('AccountingPolicy');
    var Institution = mongoose.model('Institution');
    var Factory = mongoose.model('AccountFactory');

    if (!this.isNew) return next();

    var self = this;
    var query = null;
    var institutionPolicy = false;
    var institution = null;
    if (this.accountingPolicy) {
      query = Policy.findById(ensureId(this, 'accountingPolicy'));
    } else if (this.institution && this.institution.accountingPolicy) {
      query = Policy.findById(ensureId(this.institution, 'accountingPolicy'));
    } else {
      query = Institution
      .findById(ensureId(this, 'institution'))
      .populate("accountingPolicy");
      institutionPolicy = true;
    }

    var owner = ensureId(self, "owner") || self._id;

    this.accounts = this.accounts || {};
    return query.exec(function (err, policy) {
      if (err) next(err);
      if (!policy) return next();
      if (institutionPolicy) policy = policy.accountingPolicy;
      if (!policy) return next();
      policy = policy.factories;
      if (!policy) return next();
      policy = policy[subject];
      if (!policy) return next();

      var accounts2beOpen = [];
      var aName;
      for (var i=0;i<accountsList.length; i++) {
        aName = accountsList[i];
        if (!self.accounts[aName] && policy[aName]) accounts2beOpen.push(aName);
      }

      if (accounts2beOpen.length) {
        return async.each(accounts2beOpen, function(accountName, cb) {
          Factory.openAccount({
            factory: policy[accountName],
            owner: owner == self._id ? self : owner,
            status: "open"
          }, function(err, account) {
            if (err) return cb(err);
            self.accounts[accountName] = account._id;
            cb();
          });
        }, function(err) {
          if (err) return next(err);
          next();
        });
      }
      return next();
    });
  });
}
