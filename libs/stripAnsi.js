// ansi-regex@2.0.0
var gre = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g

// strip-ansi@3.0.1
module.exports = function (str) {
  return typeof str === 'string' ? str.replace(gre, '') : str;
}
module.exports.gre = gre;
