var _e = require("util")._extend;
module.exports = exports = extendAccount;

function extendAccount(options) {
  return _e({
    type: String, ref: "Account", required: true
  }, options);
}
