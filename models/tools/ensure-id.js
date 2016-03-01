function ensureId(obj, prop) {
  if (!obj || !prop || !obj[prop]) return null;
  return obj[prop]._id || obj[prop];
}

module.exports = exports = ensureId;
