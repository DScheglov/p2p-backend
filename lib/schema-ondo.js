var mongoose = require('mongoose');
var EventEmitter = require('events').EventEmitter;
var async = require('async');

EventEmitter.prototype.emitAsync = function () {
  var handlers, args, events, type, callback, self;

  type = arguments[0];
  self = this;
  callback = arguments[arguments.length - 1];
  args = Array.prototype.slice.call(arguments, 1, -1);

  events = this._events;
  if (!events) return callback();

  handlers = events[type];
  if (!handlers) return callback();

  handlers = Array.isArray(handlers) ? handlers : [handlers];

  async.eachSeries(handlers, function (fn, next) {
    var err, _args;

    // Async
    _args = args.slice();
    _args.push(next);
    fn.apply(self, _args);
  }, callback);

  return true;
}

mongoose.Schema.prototype.ondo = function(event, fn) {

  return this.queue('on', [event, function() {
    var doc = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);
    fn.apply(doc, args);
  }]);

};

mongoose.Document.prototype.emitAsync = function() {
  return this.$__.emitter.emitAsync.apply(this.$__.emitter, arguments);
}

module.exports = exports = {};
