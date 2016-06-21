var util = require('util');

module.exports = function () {
  console.warn('\x1b[33m' + util.format.apply(util, arguments) + '\x1b[0m');
}
