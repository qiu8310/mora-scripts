var fs = require('fs');

module.exports = function (filepath, types) {
  if (!types) types = 'File';

  try {
    var stats = fs.statSync(filepath);
    return [].concat(types).some(function (type) {
      type = type[0].toUpperCase() + type.slice(1);
      return stats['is' + type] && stats['is' + type]();
    });
  } catch (e) {
    return false;
  }
}
