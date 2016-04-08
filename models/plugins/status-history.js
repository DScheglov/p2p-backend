var statuses = ['new', 'active', 'closed'];

module.exports = exports = statusHistory;

function statusHistory(schema, options) {
  options = options || {};
  var statusList = options.statusList || statuses;
  var defaultStatus = options.defaultStatus || statusList[0];

  schema.add({
    status: {
      type: String,
      required: true,
      enum: statusList,
      default: defaultStatus
    },
    __prevStatus: String,
    statusDate: { type: Date, required: true },
    statusHistory: [{
      status: String,
      from: Date,
      to: Date
    }]
  });

  schema.index({status: 1});

  schema.path("status").set(function (v) {
    if (v!=this.status && statusList.indexOf(v) >= 0) {
      this.__prevStatus = this.status;
    }
    return v;
  });

  schema.pre("validate", function(next) {
    var newStatusDate = new Date();

    if (this.isNew || this.isModified("status")) {
      if (this.statusDate) {
        this.statusHistory.push({
          status: this.__prevStatus,
          from: this.statusDate,
          to: newStatusDate
        });
      };
      this.statusDate = newStatusDate;
    } else {
      this.statusDate = this.statusDate || newStatusDate;
    }
    next();
  });

}
statusHistory.statuses = statuses;
