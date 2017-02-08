'use strict';

module.exports = exports = extendAccount;

function extendAccount(options) {
  return Object.assign({
    type: String, ref: "Account", required: true
  }, options);
}
