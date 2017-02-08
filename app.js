var mongoose    = require('./mongoose');
var log         = require('./lib/logger')(module);
var Account   = require('./models/accounts').Account;
var Transaction = require('./models/transactions').Transaction;
var async    = require("async");

mongoose.connect('mongodb://localhost/p2p');
var db = mongoose.connection;

db.on('error', function (err) {
  log.error('connection error:', err.message);
});
db.once('open', function callback () {
  var A1 = new Account({
    institution:  "56cb036745e3e6800c69c45d",
    number: "22031234567890",
    title: "Loan account",
    type: "Assets",
    currency: "UAH",
    status: "open"
  });
  var A2 = new Account({
    institution:  "56cb036745e3e6800c69c45d",
    number: "26261234567891",
    title: "Card Account B",
    type: "Liability",
    currency: "UAH",
    status: "open"
  });
  var T = null;
  function _do(next) {
    return function (err) {
      if (err) return next(err);
      next(null);
    };
  }
  async.waterfall([
      function (next) {
        log.info("Cleaning Accounts");
        Account.remove().exec();
        next();
      },
      function (next) {
        log.info("Cleaning Transactions");
        Transaction.remove().exec();
        next();
      },
      function (next) {
        log.info("Saving A1");
        A1.save(_do(next))
      },
      function (next) {
        log.info("Saving A2");
        A2.save(_do(next));
      },
      function (next) {
        log.info("Creating and saving transaction");
        T = new Transaction({
          debitAccount: A1._id,
          creditAccount: A2._id,
          type: "Type 1",
          amount: 1000,
          description: "The first transaction",
          status: "approved"
        });
        T.save(_do(next));
      },
      function (next) {
        log.info("Executing transaction");
        T.execute(function (err, tx) {
          if (err) {
            log.error(err.message);
          }
          return next();
        });
      },
      function (next) {
        log.info("Refreshing A1");
        Account.findOne({_id: A1.id}, function (err, A) {
          if (err) return next(err);
          A1 = A;
          next();
        });
      },
      function (next) {
        log.info("Refreshing A2");
        Account.findOne({_id: A2.id}, function (err, A) {
          if (err) return next(err);
          A2 = A;
          next();
        });
      }
  ], function (err) {
    log.info("Processing results");
    if (T) console.dir(T.toJSON());


    if (err) {
      db.close();
      log.error(err.message);
      console.dir(err.errors);
      return;
    }
    log.info(A1.number +" "+A1.title+": "+A1.balance);
    console.dir(A1.toJSON());
    log.info(A2.number +" "+A2.title+": "+A2.balance);
    console.dir(A2.toJSON());
    db.close();
  });

});

module.exports.db = db;
