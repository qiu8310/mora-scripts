/**
 * @module      libs/lang/isObject
 * @createdAt   2016-07-01
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

/**
 * 判断 any 是不是一个 JS Object
 *
 * 除了 null, 及字面量，其它一般都是 Object，包括 函数
 *
 * @param   {*}      any   任何的 JS 类型
 * @return  Boolean
 *
 * @see     [is-obj@1.0.1]{@link https://github.com/sindresorhus/is-obj/tree/v1.0.1}
 * @author  Zhonglei Qiu
 * @since   2.0.0
 */
module.exports = function(any) {
  var type = typeof any
  return any !== null && (type === 'object' || type === 'function')
}
