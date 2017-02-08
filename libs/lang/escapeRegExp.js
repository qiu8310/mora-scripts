/**
 * @module      libs/lang/escapeRegExp
 * @createdAt   2016-06-30
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var gre = /[-.*+?^${}()|[\]/\\]/g
var re = /[-.*+?^${}()|[\]/\\]/

/**
 * 对字符串中的字符进行转义
 *
 * 在用 new RegExp 创建正则表达式时很常用
 *
 * @param  {String} str 要转义的字符串
 * @return {String}     转义后的字符串
 *
 * @author    Zhongle Qiu
 * @since     2.0.0
 */
module.exports = function(str) {
  return str.replace(gre, '\\$&')
}

/**
 * 转义使用的全局的正则表达式
 * @type {RegExp}
 *
 * @author    Zhongle Qiu
 * @since     2.0.0
 */
module.exports.gre = gre

/**
 * 转义使用的非全局的正则表达式
 * @type {RegExp}
 *
 * @author    Zhongle Qiu
 * @since     2.0.0
 */
module.exports.re = re
