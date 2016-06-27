var toString = require('./toString')

module.exports = function (any) {
  return toString(any) === '[object Object]'
}
