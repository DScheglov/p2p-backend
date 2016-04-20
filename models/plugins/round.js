var Round = require('fin-rounds').Round;

module.exports = exports = function (schema, options) {
  options = options || {};
  schema.add({
    rounding: {
      type: {
        method: {type: String, default: 'native', enum: Round.allowedMethods},
        precision: Number
      },
      required: true,
      default: {
        method: options.method || 'native',
        precision: options.precision || 0
      }
    }
  });

  schema.virtual('round').get(function () {
    if (this.$__.round instanceof Round) return this.$__.round;
    this.$__.round = new Round(this.rounding.method, this.rounding.precision);
    return this.$__.round;
  });

};
