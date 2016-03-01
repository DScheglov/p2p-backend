module.exports = exports = function instHeaderMiddlware(req, res, next) {
  var xInst = req.get("x-institution");
  req.body = req.body || {};
  req.body.institution = xInst;
  next();
};
