/**
 * @module      libs/lang/hasOwnEnumProp
 * @createdAt   2016-07-01
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var isObject = require('./isObject')

/**
 * 判断 obj 对象是否含有某个 key，且 key 需要 enumerable （ 利用 getOwnPropertyDescriptor ）
 *
 * 另外也可以使用 Object.prototype.propertyIsEnumerable.call(obj, key)
 *
 * @param   {Object} obj
 * @param   {String} key
 * @return  {Boolean}
 *
 * @author  Zhonglei Qiu
 * @since   2.0.0
 */
module.exports = function(obj, key) {
  // 如果不做判断 node v0.12 会报 TypeError: Object.getOwnPropertyDescriptor called on non-object
  // 但高版本的都不会报错
  if (!isObject(obj)) return false

  // https://github.com/sindresorhus/dot-prop/issues/23
  // 可以过滤掉原生的像 hasOwnProperty 这样的 key
  var descriptor = Object.getOwnPropertyDescriptor(obj, key)

  return !!(descriptor && descriptor.enumerable)
}
