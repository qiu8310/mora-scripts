/**
 * 简化版的缓存配置
 *
 * @module      libs/storage/Config
 * @createdAt   2016-07-21
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */
var DotProp = require('../lang/DotProp')

/**
 * @class
 * @param {Storage} storage
 */
function Config(storage) {
  if (!storage.data) storage.initSync()

  this.dp = new DotProp(storage.data)
  this.storage = storage
}

/**
 * 是否存在某个 key
 * @param  {String}  key
 * @return {Boolean}
 */
Config.prototype.has = function(key) {
  return this.dp.has(key)
}

/**
 * 获取某个 key 对应的值
 * @param  {String} key
 * @return {*}
 */
Config.prototype.get = function(key) {
  return this.dp.get(key)
}

/**
 * 删除某个 key
 * @param  {String} key
 * @return {Boolean}     是否删除成功
 */
Config.prototype.del = function(key) {
  var rtn = this.dp.del(key)
  if (rtn) {
    this.storage.updateSync()
  }
  return rtn
}

/**
 * 修改某个 key 上对应的值
 * @param {String} key
 * @param {*} val
 * @return {Boolean} 是否修改成功
 */
Config.prototype.set = function(key, val) {
  var rtn = this.dp.set(key, val)
  if (rtn) {
    this.storage.updateSync()
  }
  return rtn
}

module.exports = Config
