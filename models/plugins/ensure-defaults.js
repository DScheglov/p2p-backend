module.exports = exports = ensureDefaults;

function ensureDefaults(schema, options) {

  var notIsIn = null;
  if (options) {
    switch (typeof(options)) {
      case "array": notIsIn = function (v) { return options.indexOf(v)<0}; break;
      case "object": notIsIn = function (v) {return !options[v]}; break;
      default: notIsIn = null;
    };
  }

  schema.pre("validate", function (next) {
    var paths = Object.keys(this.schema.paths);
    var i=0;
    for (;i<paths.length;i++) {
      var p = paths[i];
      if (notIsIn && notIsIn(v)) continue;
      if (typeof(this.get(p)) === 'undefined') {
        this.set(p, this.schema.paths[p].getDefault(this));
      };
    }
    next();
  });

};
