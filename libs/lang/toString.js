/**
 * @module      libs/lang/toString
 * @createdAt   2016-06-30
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

/**
 * 获取 any 对象的原生的 toString 的结果
 *
 * @param   {*}      any   任何的 JS 类型
 * @return  {String}
 *
 * @author  Zhonglei Qiu
 * @since   2.0.0
 */
module.exports = function(any) {
  return Object.prototype.toString.call(any)
}
