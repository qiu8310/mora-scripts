/**
 * @module      libs/fs/exists
 * @createdAt   2016-06-30
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var fs = require('fs')

/**
 *
 * 以同步的方式判断文件是否存在
 *
 * 支持指定允许的文件类型，默认只会判断 stat.isFile，
 * 通过第二个参数可以指定文件类型，可以设置成单个，
 * 或多个类型；如果指定了多个类型，则只要有一个成功
 * 就会返回 true
 *
 * @param     {String}               filepath    文件路径
 * @param     {String|Array<String>} [allowTypes]  允许的文件类型，支持下面几种：
 *   - File
 *   - Directory
 *   - BlockDevice
 *   - CharacterDevice
 *   - FIFO
 *   - Socket
 *
 * @return    {Boolean}
 *
 * @example
 *
 * exists('./some/path')                         // 判断是否是文件
 * exists('./some/path', 'File')                 // 判断是否是文件
 * exists('./some/path', 'Directory')            // 判断是否是文件夹
 * exists('./some/path', ['File', 'Directory'])  // 判断是文件或者文件侠，返回 false/'file'/'directory'
 *
 *
 * @author    Zhongle Qiu
 * @since     2.0.0
 *
 */
module.exports = function(filepath, allowTypes) {
  if (!allowTypes) allowTypes = 'File'

  try {
    var stats = fs.statSync(filepath)
    return [].concat(allowTypes).some(function(type) {
      var typeFn = 'is' + type[0].toUpperCase() + type.slice(1)
      return stats[typeFn] && stats[typeFn]() && type
    })
  } catch (e) {
    return false
  }
}

/**
 * 文件是否存在
 * @param  {String} file 文件路径
 * @return {Boolean}
 */
module.exports.file = function(file) {
  return module.exports(file, 'File')
}

/**
 * 目录是否存在
 * @param  {String} dir 目录路径
 * @return {Boolean}
 */
module.exports.directory = function(dir) {
  return module.exports(dir, 'Directory')
}
