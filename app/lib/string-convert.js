exports.camelCaseToDash = camelCaseToDash
exports.dashToCamelCase = dashToCamelCase

/**
 * Transforms a camelCase formatted string to a dash formatted string
 * @param {String} myStr The camelCase string to convert to dash notation 
 * @author youssman - https://gist.github.com/youssman/745578062609e8acac9f
 */
function camelCaseToDash(myStr) {
  return myStr.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
}

/**
 * Transforms a dash formatted string to a camelCase formatted string
 * @param {String} myStr The dash string to convert to camelCase 
 * @author youssman - https://gist.github.com/youssman/16fcf30d8985d0f559f8
 */
function dashToCamelCase(myStr) {
  return myStr.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}
