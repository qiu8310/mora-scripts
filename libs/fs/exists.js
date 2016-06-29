var fs = require('fs');
/* !md

  以同步的方式判断文件是否存在

  支持指定允许的文件，默认只会判断 stat.isFile，
  通过第二个参数可以指定文件类型，可以设置成单个，
  或多个类型；如果指定了多个类型，则只要有一个成功
  就会返回 true

  ## API

  ```
  exists(filepath: String, types: String | Array<String>): Boolean
  ```

  type 支持如下几个参数（支持首字母小写）：

  - File
  - Directory
  - BlockDevice
  - CharacterDevice
  - FIFO
  - Socket


  ## Examples

  ```
  exists('./some/path')                         // 判断是否是文件
  exists('./some/path', 'File')                 // 判断是否是文件
  exists('./some/path', 'Directory')            // 判断是否是文件夹
  exists('./some/path', ['File', 'Directory'])  // 判断是文件或者文件侠，返回 false/'file'/'directory'
  ```

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
