'use strict';

module.exports = exports = ensureDefaults;

function ensureDefaults(schema, options) {
  let notIsIn = null;

  if (options) {
    switch (typeof(options)) {
      case "array": notIsIn = function (v) { return options.indexOf(v)<0}; break;
      case "object": notIsIn = function (v) {return !options[v]}; break;
      default: notIsIn = null;
    };
  }

  schema.pre("validate", function(next) {
    if (!this._doc) return next();
    Object.keys(this.schema.paths).forEach( p => {
      if (notIsIn && notIsIn(p)) return;
      if (typeof(this.get(p)) === 'undefined') {
        this.set(p, this.schema.paths[p].getDefault(this));
      };
    });
    next();
  });

};
