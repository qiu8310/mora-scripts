/**
 * @module      libs/sys/xlog
 * @createdAt   2016-07-15
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var util = require('util')
var extend = require('./extendFormat')
var clog = require('./clog')
var cliTextSize = require('../tty/cliTextSize')

/**
 * 输出带样式的字符串，拥有 {@link module:libs/sys/clog} 的所有功能
 *
 * FORMAT  |  EXPLAIN
 * --------|-----------
 * %d      |  格式化成整数，使用了 parseInt
 * %\d*f   |  格式化成浮点数，使用了 parseFloat，中间的数字表示保存的小数位数
 * %j, %o  |  格式化成对象，使用了原生的 util.format('%j', val)
 * %c      |  格式化成颜色，使用了 {@link module:libs/sys/clog.format}
 * %...s   |  格式化字符串，支持对齐，参数复杂，用 ... 表示省略，说情参看 {@link module:libs/sys/xlog.align}
 *
 * @param {String} template   模板
 * @param {...*}   [arg]      模板的参数
 * @param {String} [template] 第二个模板，后面可以继续接 ...arg, template, ...arg, ...
 *
 * @example
 * xlog('price %2f$', 100)  => 'price 100.00$'
 *
 * xlog('%5:<.>s', 'a')     => '<<a>>'
 * xlog('%5:<.>s', 'abc')   => '<abc>'
 *
 * @method
 * @author Zhonglei Qiu
 * @since  2.0.0
 */
module.exports = xlog
exports = module.exports

/**
 * 对齐 str 字符串
 *
 * @type   {Function}
 * @param  {String} str    要对齐的字符串
 * @param  {String} format 对齐规则，规则如下
 *
 *  EXAMPLE    |    EXPLAIN
 *  -----------|----------------
 *  3          |  至少有3个字符，没有的话在左边补【默认字符】
 *  .3         |  至少有3个字符，没有的话在右边补【默认字符】
 *  1.2        |  至少3个字符，不足的话左右两边填充【默认字符】，先填左，再填右，再填右
 *  1.2:_      |  至少3个字符，没有的话在左边补 _，在右边补【默认字符】
 *  1.2:.0     |  至少3个字符，没有的话在左边补【默认字符】，在右边补 0
 *  1.2:_.0    |  至少3个字符，没有的话在左边补 _，在右边补 0
 *
 * @param  {Object} opts   配置选项
 * @param  {String} [opts.leftPad=" "]    左侧填充的【默认字符】
 * @param  {String} [opts.rightPad=" "]   右侧填充的【默认字符】
 *
 * @return {String}        对齐后的 str
 */
exports.align = function(str, format, opts) {
  opts = opts || {}
  var lLen, rLen, lPad, rPad, i, diff
  var flag = true

  var parts = format.split(':')
  var lens = parts.shift().split('.')
  var pads = parts.join(':').split('.')

  lLen = parseInt(lens[0] || '0', 10)
  rLen = parseInt(lens[1] || '0', 10)
  lPad = pads[0] || opts.leftPad || ' '
  rPad = pads[1] || opts.rightPad || ' '

  if (lLen === 0 && rLen === 0) return str

  diff = lLen + rLen - cliTextSize(str)
  if (diff <= 0) return str

  for (i = 0; i < diff; i++) {
    if ((flag || rLen === 0) && lLen > 0) {
      str = lPad + str
      lLen--
    } else {
      str += rPad
      rLen--
    }
    flag = !flag
  }
  return str
}

/**
 * {@link module:libs/sys/xlog} 使用的 format 函数，类似于 console.log 使用了 util.format 函数
 *
 * @method
 * @return {String}  格式化后的字符串
 */
exports.format = extend([
  clog.colorMatcher,
  {
    match: /%[jo]/,
    order: 1,
    handle: function(val) {
      return util.format('%j', val)
    }
  },
  {
    match: /%(?:\d+)?\.?(?:\d+)?(?::.\.?.?)?s/,
    order: 1,
    handle: function(val, format) {
      return exports.align(String(val), format.slice(1, -1))
    }
  },
  {
    match: /%d/,
    order: 2,
    handle: function(val) {
      return parseInt(val, 10)
    }
  },
  {
    match: /%\d*f/,
    order: 2,
    handle: function(val, format) {
      var fixed = parseInt(format.substr(1), 10)
      val = parseFloat(val)
      return fixed ? val.toFixed(fixed) : val.toString()
    }
  }
]);

// @FIXME 这些字段无法生成 jsdoc
['autoResetAtEnd', 'autoResetAtGroupEnd', 'NAMED_COLORS'].forEach(function(k) {
  Object.defineProperty(xlog, k, {
    enumerable: true,
    configurable: true,
    set: function(val) { clog[k] = val },
    get: function() { return clog[k] }
  })
})

function xlog() {
  console.log(exports.format.apply(null, arguments))
}

