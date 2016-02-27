var async = require("async");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Account = require("./accounts").Account;
var ensureCallback = require("./safe-callback").ensureCallback;

var transTypes = ["Type 1", "Type 2", "Type 3"];
var transStatuses = ["new", "approved", "pending", "applied", "canceling", "done", "failed"];
var TransactionSchema = Schema({
	debitAccount: {type: String, required: true, ref: "Account"},
	creditAccount: {type: String, required: true, ref: "Account"},
	amount: {type: Number, required: true},
	description: {type: String, required: true},
	type: {type: String, enum: transTypes, required: true},
	status: {type: String, enum: transStatuses, required: true, 'default': transStatuses[0]},
	statusDescription: String,
	lastModified: {type: Date, required: true, 'default': Date.now }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

TransactionSchema.methods.verify = function(callback) {
	callback = ensureCallback.apply(null, arguments);
	return true;
};

TransactionSchema.methods.approve = function(callback) {
	callback = ensureCallback.apply(null, arguments);
	if (this.verify()) {
		this.status = "approved";
		return this.save(callback);
	};
};

TransactionSchema.methods.execute = function (callback) {
	var tx = this;

	callback = ensureCallback.apply(null, arguments);

	switch (tx.status) {
		case "approved":	return tx_start();
		case "pending":		return tx_apply();
		case "applied": 	return tx_push();
		case "canceling": 	return tx_rollback();
	};

	return callback(new Error("Transaction status doesn't allow it to be executed."), tx);

	function tx_fail(err) {
		var fail_err = err;
		if (err) tx.statusDescription = err.message;
		tx.status = "failed";
		tx.lastModified = new Date();
		return tx.save(function(err) {
			if (err) return callback(err, tx);
			callback(fail_err || new Error("Transaction failed"), tx);
		});
	};

	function tx_start() {
		tx.status = "pending";
		tx.lastModified = new Date();
		tx.save(function(err, obj) {
			if (err) return tx_fail(err);
			return tx_apply();
		});
	};

	function _do(next) {
		return function(err, obj) {
			return next(err);
		};
	}

	function tx_apply() {
		if (tx.status != "pending") return;
		async.waterfall([
		  function (next) {
		    	 Account.update({
		 			_id: tx.debitAccount,
		 			_pendingDebit: {$ne: tx._id},
		 			status: "open"
		 		}, {
		 			$inc: {debit: tx.amount},
		 			$push: {_pendingDebit: tx._id}
		 		}, function (err, res) {
		 			if (err) return next(err);
		 			if (res.n == 0) return next(new Error("Status of Account doesn't allow to debit it"));
		 			next();
		 		});
		     },
		     function (next) {
		    	 Account.update({
			 			_id: tx.creditAccount,
			 			_pendingCredit: {$ne: tx._id},
			 			status: {$in: ["open", "preopen"]}
			 		}, {
			 			$inc: {credit: tx.amount},
			 			$push: {_pendingCredit: tx._id}
			 		}, function (err, res) {
			 			if (err) return next(err);
			 			if (res.n == 0) return next(new Error("Status of Account doesn't allow to credit it"));
			 			next();
			 		});
		     },
		     function (next) {
		 		tx.status = "applied";
				tx.lastModified = new Date();
				tx.save(_do(next));
		  }
		], function (err) {
			if (err) return tx_rollback(err);
			tx_push();
		});
	};

	function tx_push() {
		if (tx.status != "applied") return;
		async.waterfall([
			function (next) {
				 Account.update({
					_id: tx.debitAccount,
					_pendingDebit: tx._id
				}, {
					$pull: {_pendingDebit: tx._id}
				}, _do(next));
			},
			function (next) {
				 Account.update({
						_id: tx.creditAccount,
						_pendingCredit: tx._id
					}, {
						$pull: {_pendingCredit: tx._id}
					}, _do(next));
			},
			function (next) {
				tx.status = "done";
				tx.lastModified = new Date();
				tx.save(_do(next));
			}
		], function (err) {
				if (err) return callback(err, tx);
				callback(null, tx);
			}
		);
	};

	function tx_rollback(err) {
		var rollback_err = err;
		async.waterfall([
		    function (next) {
		    	if (tx.status == "canceling") return next();
				tx.status = "canceling";
				tx.lastModified = new Date();
				tx.save(_do(next));
		    },
  			function (next) {
  				 Account.update({
  						_id: tx.creditAccount,
  						_pendingCredit: tx._id
  					}, {
  						$inc: {credit: -tx.amount},
  						$pull: {_pendingCredit: tx._id}
  					}, _do(next));
  			},
  			function (next) {
 				 Account.update({
 					_id: tx.debitAccount,
 					_pendingDebit: tx._id
 				}, {
 					$inc: {debit: -tx.amount},
 					$pull: {_pendingDebit: tx._id}
 				}, _do(next));
 			}
  		], function (err) {
  				if (err) return callback(err, tx);
  				return tx_fail(rollback_err);
  			}
  		);
	};

};

var Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = exports = {
	Transaction: Transaction
};
