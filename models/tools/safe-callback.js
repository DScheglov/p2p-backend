module.exports = exports = {
  ensureCallback: function() {
    var i = 0;
    var cb = null;
    for (;i<arguments.length && cb == null; i++) {
      cb = arguments[i] instanceof Function ? arguments[i] : null;
    };

    return cb || function() {};
  }
};
