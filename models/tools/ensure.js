// ======================================================================== //
// Interface
//

module.exports = exports = {
  id: ensureId,
  callback: ensureCallback
}

// ======================================================================== //
// Implementation
//

/**
 * ensureId - returns the _id reference on the object.
 *
 * @param  {Document} obj  the document contains reference field
 * @param  {String} prop the name of reference field
 * @return {any}      the reference
 */
function ensureId(obj, prop) {
  if (!obj || !prop || !obj[prop]) return null;
  return obj[prop]._id || obj[prop];
}

/**
 * ensureCallback - returns the first Function looking backward in params list
 *
 * @return {Function}  callback function
 */
 function ensureCallback() {
   var i = arguments.length - 1;
   var cb = null;
   for (;i >= 0; i--) {
     cb = arguments[i];
     if (cb instanceof Function) return cb;
   };
   return null;
 }
