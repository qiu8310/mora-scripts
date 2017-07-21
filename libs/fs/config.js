/**
 *
 * @module      libs/fs/config
 * @createdAt   2017-07-21
 *
 * @copyright   Copyright (c) 2017 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var path = require('path')
var ospath = require('./ospath')
var findup = require('./findup')
var assign = require('../lang/assign')
var warn = require('../sys/warn')

/**
 * 获取本地的配置文件
 * @param  {string} name   - 配置文件名称（可以不带后缀）
 * @param  {Object} options
 * @param  {boolean} options.merge   - 是否 merge 找到的所有配置文件（默认只返回最先找到的）
 * @return {any}
 */
module.exports = function(name, options) {
  var dirs = []
  var addDir = function(dir) {
    dir = path.resolve(dir)
    if (dirs.indexOf(dir) < 0) dirs.push(dir)
  }

  addDir(process.cwd())
  try {
    addDir(path.dirname(findup.pkg()))
  } catch (e) {}
  addDir(ospath.home())

  var result
  dirs.some(function(dir) {
    var filename = path.join(dir, name)

    try {
      var data = require(filename)
      if (!result) result = data
      else result = assign(data, result)
      return !options.merge
    } catch (e) {
      if (e instanceof SyntaxError) warn(e.message)
    }
  })

  return result
}
