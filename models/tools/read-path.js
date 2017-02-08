'use strict';

module.exports = exports = readPath;

function readPath(path) {

  return function __readPath() {
    if (!this._doc) {
      return;
    }
    var v = this.get(path);
    return v;
  };

}
