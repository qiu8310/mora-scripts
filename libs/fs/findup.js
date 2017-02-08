/**
 * @module      libs/fs/findup
 * @createdAt   2016-06-30
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var fs = require('fs')
var path = require('path')
var exists = require('./exists')

/**
 *
 * 递归向上查找满足条件的文件夹
 *
 * @param  {String}           dir          起始查找目录
 * @param  {String|Function}  iteratorSync 要查找到文件名，或者返回 Boolean 值的函数，
 *                                         如果此参数是函数，那么它会接收到参数是当前递归所在的目录
 * @param  {Object}           [options]    配置选项
 *
 *   - allowTypes:  {String|Array<String>} 要查找的文件所属类型， 参考 {@link module:libs/fs/exists} 函数的第二个参数
 *   - maxdepth:    {Number}               递归的深度，1：表示只会查找当前文件夹下的文件，2：表示查找当前文件夹和上一个文件夹 ...
 *
 * @throws {Error}            如果没有找到任何满足条件的文件夹
 * @return {String}           查找到的满足条件的文件夹路径
 *
 * @author    Zhongle Qiu
 * @since     2.0.0
 *
 */
module.exports = function(dir, iteratorSync, options) {
  dir = path.normalize(dir)
  options = options || {}

  if (typeof iteratorSync === 'string') {
    var file = iteratorSync
    iteratorSync = function(dir) {
      return exists(path.join(dir, file), options.allowTypes)
    }
  }

  var currentDepth = 0
  while (dir !== path.resolve(dir, '..')) {
    if (typeof options.maxdepth === 'number' && options.maxdepth >= 0 && currentDepth >= options.maxdepth) {
      break
    }
    currentDepth++
    if (iteratorSync(dir)) return dir
    dir = path.resolve(dir, '..')
  }
  throw new Error('Not found')
}

exports = module.exports

function _find(root, file, allowTypes) {
  if (file == null) {
    file = root
    root = process.cwd()
  }
  var dir = exports(root, file, {allowTypes: allowTypes})
  return path.resolve(path.join(dir, file))
}

/**
 * 递归向上查找指定的文件
 *
 * @param  {String} [root]  起始查找目录（如果没有指定，则从当前路径开始）
 * @param  {String} file    要查找的文件名
 * @throws {Error}          如果没有找到满足条件的文件
 * @return {String}         返回查到的文件路径
 *
 * @author    Zhongle Qiu
 * @since     1.5.0
 */
exports.file = function(root, file) {
  return _find(root, file, 'File')
}

/**
 * 递归向上查找指定的文件夹
 *
 * @param  {String} [root]  起始查找目录（如果没有指定，则从当前路径开始）
 * @param  {String} dir     要查找的文件夹名
 * @throws {Error}          如果没有找到满足条件的文件夹
 * @return {String}         返回查到的文件夹路径
 *
 * @author    Zhongle Qiu
 * @since     1.5.0
 */
exports.dir = function(root, dir) {
  return _find(root, dir, 'Directory')
}

/**
 * 递归向上查找 package.json 文件
 *
 * @param  {String} [root]  起始查找目录（如果没有指定，则从当前路径开始）
 * @throws {Error}          如果没有找到 package.json 文件
 * @return {String}         返回查到的 package.json 的路径
 *
 * @author    Zhongle Qiu
 * @since     1.5.0
 */
exports.pkg = function(root) {
  return exports.file(root || process.cwd(), 'package.json')
}

/**
 * 递归向上查找 .git 文件夹
 *
 * @param  {String} [root]  起始查找目录（如果没有指定，则从当前路径开始）
 * @throws {Error}          如果没有找到 .git 文件夹
 * @return {String}         返回查到的 .git 文件夹的路径
 *
 * @author    Zhongle Qiu
 * @since     1.5.0
 */
exports.git = function(root) {
  var dir = _find(root || process.cwd(), '.git', ['File', 'Directory'])

  var stats = fs.statSync(dir)
  if (!stats.isDirectory()) { // .git 可能是一个文件，而不是文件夹
    return fs.readFileSync(dir, 'utf8').substring('gitdir: '.length).trim()
  }
  return dir
}

