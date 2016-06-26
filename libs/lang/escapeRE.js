var gre = /[-.*+?^${}()|[\]\/\\]/g;
var re = /[-.*+?^${}()|[\]\/\\]/;

module.exports = function (str) { return str.replace(gre, '\\$&') }
module.exports.gre = gre
module.exports.re = re
