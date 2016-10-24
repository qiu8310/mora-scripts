/**
 * @module      libs/lang/isPlainObject
 * @createdAt   2016-06-30
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var toString = require('./toString')

/**
 * 判断 any 是不是一个原生的 Object，一般也叫做 PlainObject
 *
 * @param   {*}      any   任何的 JS 类型
 * @return  Boolean
 *
 * @author  Zhonglei Qiu
 * @since   2.0.0
 */
module.exports = function(any) {
  return toString(any) === '[object Object]'
}
