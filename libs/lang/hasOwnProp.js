/**
 * @module      libs/lang/hasOwnProp
 * @createdAt   2016-07-01
 */

var hasOwnProp = Object.prototype.hasOwnProperty

/**
 * 判断 obj 对象是否含有某个 key （ 利用 hasOwnProperty ）
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

  return hasOwnProp.call(obj, key)
}
