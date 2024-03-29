/**
 * @module      libs/sys/info
 * @createdAt   2016-07-14
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var util = require('util')
var data = require('./_data')

function format() {
  return data.info + util.format.apply(util, arguments) + data.end
}

/**
 * 输出兰色的字符串
 *
 * 函数参数和 util.format 一样
 *
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
module.exports = function() { console.log(format.apply(null, arguments)) }

/**
 * 返回兰色的字符串
 *
 * 函数参数和 util.format 一样
 *
 * @type {Function}
 *
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
module.exports.format = format

// /* istanbul ignore next */
// if (!module.parent) console.log(format.apply(null, process.argv.slice(2)))
