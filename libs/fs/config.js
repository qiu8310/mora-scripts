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
 * 获取指定名称的的配置文件
 *
 * 会查找当前文件目录、项目目录、用户 HOME 目录，通过 require 来引入文件（所以可以不用后缀）
 *
 * @param  {string} name   - 配置文件名称（可以不带后缀）
 * @param  {Object} options
 * @param  {boolean} options.merge   - 是否 merge 找到的所有配置文件（默认只返回最先找到的）
 * @param  {boolean} options.nocache   - 禁用 require 的 cache，即可以保证每次都重新 require
 * @return {any}
 */
module.exports = function(name, options) {
  options = options || {}
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
      if (options.nocache) {
        try {
          delete require.cache[require.resolve(filename)]
        } catch (e) {
          // 没有文件，直接返回
          return
        }
      }

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
