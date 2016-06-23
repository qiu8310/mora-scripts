var util = require('util')

function format() {
  return '\x1b[36m' + util.format.apply(util, arguments) + '\x1b[0m'
}

module.exports = function () { console.warn(format.apply(null, arguments)) }
module.exports.format = format
