/**
 * @module      libs/tty/stripAnsi
 * @createdAt   2016-07-17
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var gre = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g

/**
 * 去掉字符串中的 ansi escape 字符
 *
 * @param  {*} str      需要去除 ansi escape code 的字符串，如果 str 不是字符串，则返回它本身
 * @return {String}     去除 ansi escape code 之后的字符串
 *
 * @see [ansi escape code from wiki]{@link https://en.wikipedia.org/wiki/ANSI_escape_code}
 * @see [strip-ansi@3.0.1]{@link https://github.com/chalk/strip-ansi/tree/v3.0.1}
 *
 * @example
 * stripAnsi('\u001b[31ma\u001b[0m') // 'a'
 *
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
module.exports = function(str) {
  return typeof str === 'string' ? str.replace(gre, '') : str
}

/**
 * 匹配 ansi escape code 的正则表达式
 *
 * 注意，此正则带有 global modifier
 *
 * **说明：**
 *
 * - `re` 或以 `re` 开头（如 reAnsi）表示__不__带 global modifier 的正则表达式
 * - `gre` 或以 `gre` 开头（如 greAnsi) 表示带 global modifier 的正则表达式
 *
 * @type {RegExp}
 * @see [ansi-regexp@2.0.0]{@link https://github.com/chalk/ansi-regex/tree/2.0.0}
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
module.exports.gre = gre
