/**
 * @module      libs/lang/hasOwnEnumProp
 * @createdAt   2016-07-01
 */

/**
 * 判断 obj 对象是否含有某个 key，key 需要 enumerable （ 利用 getOwnPropertyDescriptor ）
 *
 * 另外也可以使用 Object.prototype.propertyIsEnumerable
 *
 * @param   {Object} obj
 * @param   {String} key
 * @return  {Boolean}
 *
 * @author  Zhonglei Qiu
 * @since   2.0.0
 */
module.exports = function (obj, key) {
  if (obj == null) return false

  // https://github.com/sindresorhus/dot-prop/issues/23
  // 可以过滤掉原生的像 hasOwnProperty 这样的 key
  var descriptor = Object.getOwnPropertyDescriptor(obj, key)

  return !!(descriptor && descriptor.enumerable)
}
