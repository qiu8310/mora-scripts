var fs = require('fs');


/*
  同步判断文件是否存在

  支持判断文件的各种类型

  Example:

    exists('./some/path')                         // 判断是否是文件
    exists('./some/path', 'file')                 // 判断是否是文件
    exists('./some/path', 'directory')            // 判断是否是文件夹
    exists('./some/path', ['file', 'directory'])  // 判断是文件或者文件侠，返回 false/'file'/'directory'
 */

module.exports = function (filepath, types) {
  if (!types) types = 'File';

  try {
    var stats = fs.statSync(filepath);
    return [].concat(types).some(function (type) {
      var typeFn = 'is' + type[0].toUpperCase() + type.slice(1);
      return stats[typeFn] && stats[typeFn]() && type;
    });
  } catch (e) {
    return false;
  }
}
