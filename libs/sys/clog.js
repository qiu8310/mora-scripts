/**
 * @module      libs/sys/clog
 * @createdAt   2016-07-15
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var hasAnsiColorRegExp = require('../tty/stripAnsi').gre

var bgRE = /^(?:bg|background)(\w+)$/       // match:  bgRed, bgYellow ...
var resetModifRE = /^(?:reset|r)(\w+)$/     // match:  resetDim, resetItalic ...
var hexRE = /^[0-9a-f]{3}(?:[0-9a-f]{3})?$/ // match:  ff00ff, f0f ...

var PREFIX = '\x1b['
var SUFFIX = 'm'
var RESET = PREFIX + '0' + SUFFIX
var MODIFIERS = {   // reset
  bold: 1,      // 21  // 21 isn't widely supported and 22 does the same thing
  faint: 2,     // 22
  gray: 2,      // 22
  dim: 2,       // 22
  italic: 3,    // 23
  underline: 4, // 24
  reverse: 7    // 27
}

// 30-37 color;                   40-47 background
// 90-97 high intensity color;  100-107 high intensity background
//
// 注意： windows 下 high intensity black + dim 会导致文字不显示 （ high intensity black 和 dim 都是灰色 ）
// SEE： https://github.com/chalk/chalk/issues/58

// 其它
// 39 => default color;
// 49 => default background;
// 0  => reset

var NAMES = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']

var ansiStack = []
var reset = function() { ansiStack.length = 0; return RESET }
var colorMatcher = {
  match: /%c/,
  handle: function(color) {
    var ansi = parseColor(color)
    var i = ansi.indexOf(RESET)
    if (i >= 0) {
      reset()
      ansi = ansi.substr(i)
    }
    ansiStack.push(ansi)
    return ansi
  },
  onEnd: function() {
    return clog.autoResetAtEnd ? reset() : ''
  },
  onGroupEnd: function() {
    return clog.autoResetAtGroupEnd ? reset() : ''
  },
  onFormatEnd: function(arg) {
    if (this !== arg.matcher) {
      // format 的 value 自带颜色，需要保留它自带的所有样式
      if (arg.values.some(hasAnsi)) {
        return RESET + ansiStack.join('')
      }
    }
  }
}

// 1. 为了生成 jsdoc 才这样写的
// 2. 下面的那些变量需要先定义，否则 require('clog') 之后 autoResetAtEnd 这些值没没有值
exports = clog

/**
 * {@link module:libs/sys/clog} 使用的 format 函数，类似于 console.log 使用了 util.format 函数
 * @type {Function}
 */
exports.format = require('./extendFormat')(colorMatcher)

/**
 * 是否在 format 的最后加上 ANSI 的 RESET 控制字符
 *
 * @default true
 * @type {Boolean}
 */
exports.autoResetAtEnd = true

/**
 * 是否在每一个模板结尾加上 ANSI 的 RESET 控制字符（默认为 true）
 *
 * 这里解释一下，拿语句 `console.log('Are %s ok', 'you', 'I %s %s', 'am', 'ok')` 来说，
 * 句子中共有两个 group（把每一个模板和它的参数叫做一个 group）：
 *   - group 1 => 模板：'Are %s ok'， 参数：'you'
 *   - group 2 => 模板：'I %s %s'，   参数：'am', 'ok'
 *
 * 所以，如果 autoResetAtGroupEnd 是 true，则在上面每个 group 之后都会加上 reset 控制串
 *
 * @default true
 * @type {Boolean}
 */
exports.autoResetAtGroupEnd = true

/**
 * 所有支持的具名颜色值，暴露给调用方，调用方可以对其进行修改或替换
 *
 * 默认支持：
 *
 * ```
 * brown: 'A52A2A',
 * chocolate: 'D2691E',
 * ghostwhite: 'F8F8FF',
 * gold: 'FFD700',
 * navy: '000080',
 * olive: '808000',
 * orange: 'FFA500',
 * orangered: 'FF4500',
 * pink: 'FFC0CB',
 * purple: '800080',
 * seagreen: '2E8B57',
 * silver: 'C0C0C0',
 * skyblue: '87CEEB',
 * yellowgreen: '9ACD32'
 * ```
 *
 * @type {Object}
 */
exports.NAMED_COLORS = {
  brown: 'A52A2A',
  chocolate: 'D2691E',
  ghostwhite: 'F8F8FF',
  gold: 'FFD700',
  navy: '000080',
  olive: '808000',
  orange: 'FFA500',
  orangered: 'FF4500',
  pink: 'FFC0CB',
  purple: '800080',
  seagreen: '2E8B57',
  silver: 'C0C0C0',
  skyblue: '87CEEB',
  yellowgreen: '9ACD32'
}

exports.colorMatcher = colorMatcher // 提供给 xlog.js 使用

/**
 * 输出带颜色的格式化字符串
 *
 * 函数参数和 util.format 类似，只是 util.format 支持 %s %d %j %% 四个格式，
 * 此函数多支持一个 %c 的格式，用来指定后面文字的颜色
 *
 *
 * 支持的颜色字符有（所有 CODE 大小写都不敏感）：
 *
 * CODE                     |  EXPLAIN
 * -------------------------|---------------
 * reset, end               |  重置所有色值
 * h, high, l, low          |  标记颜色的明亮度，只针对 8 种基本颜色有效 {@link https://en.wikipedia.org/wiki/ANSI_escape_code#Colors}
 * fg, foreground, c, color |  标记为前景色模式
 * bg, background           |  标记为背景色模式
 * default                  |  恢复默认的前景色或背景色
 * black, red, green, yellow, blue, magenta, cyan, white  | 8 种基本颜色（不带标记默认为前景色）
 * bgBlack, backgroundBlack, bgRed, backgroundReg, ...    | 8 种基本的背景色
 * bold, faint, gray, dim, italic, underline, reverse     | 一些 modifiers
 * rBold, resetBold, rFaint, resetFaint, ...              | 重置 modifiers
 * brown, chocolate, ghostwhite, gold, navy, ...          | 默认的一些颜色，参见 {@link module:libs/sys/clog.NAMED_COLORS}
 * F00, FF0000, #F00, #FF0000 ...                         | 十六进制颜色，支持三位，或六位，支持不带 "#"
 *
 * @example
 * // 下面两个输出的 "you" 是红字黄底，其它文字都是默认的颜色
 * clog('Are %cyou%c ok', 'fg.red.bg.yellow', 'reset')
 * clog('Are %s ok', clog.format('%cyou', 'red.bgYellow'))
 *
 * @param {String}  template         模板字符串，里面可以包含 %s, %d, %j, %c, %% 这些特殊格式
 * @param {...*}    [arg]            给模板用的参数
 * @param {String}  [template2]      第二个模板，后面可以继续接 ...arg, template, ...arg, ...
 * @return {String} 格式化后的字符串
 *
 * @method
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
module.exports = clog

function clog() {
  console.log(exports.format.apply(null, arguments))
}

function hasAnsi(str) {
  return typeof str === 'string' && hasAnsiColorRegExp.test(str)
}

// c. 或者 color. 表示设置前景色
// b. bg. 或者 background. 表示设置背景色
// h. l. 或者 high. low. 可以设置成使用 high intensity 相关的颜色
// 每次切换 color 或者 background 都会自动将 high 设置成 false (high intensity color 兼容性不好)
// 而 MODIFIERS 可以随便加，不加前缀时默认使用 color.
function parseColor(color) {
  color = String(color)

  var bg = false
  var high = false
  var getNamedColorValue = function(key, forceBG) {
    return (high ? 60 : 0) + (bg || forceBG ? 40 : 30) + NAMES.indexOf(key)
  }

  /* eslint-disable no-multi-spaces, brace-style */
  return color
    .split(/[{}#.,:;"'\s]+/)
    .map(function(raw) {
      var k = raw.toLowerCase()
      // 空字符串
      if (!k) return

      // 重置
      else if (k === 'reset' || k === 'end') return 0

      // 修改状态
      else if (k === 'h' || k === 'high') { high = true  }
      else if (k === 'l' || k === 'low')  { high = false }
      else if (k === 'fg' || k === 'foreground' || k === 'c' || k === 'color') { high = false; bg = false }
      else if (k === 'bg' || k === 'background')                               { high = false; bg = true  }

      // 修改颜色
      else if (k in MODIFIERS)                                  return MODIFIERS[k]
      else if (k === 'default')                                 return bg ? 49 : 39
      else if (NAMES.indexOf(k) >= 0)                           return getNamedColorValue(k)
      else if (resetModifRE.test(k) && RegExp.$1 in MODIFIERS)  return 20 + MODIFIERS[RegExp.$1] // reset modifier 兼容性不好，少用
      else if (bgRE.test(k) && NAMES.indexOf(RegExp.$1) >= 0)   return getNamedColorValue(RegExp.$1, true)

      // hex 颜色
      else if (k in clog.NAMED_COLORS) return getHexColor(clog.NAMED_COLORS[k], bg)
      else if (hexRE.test(k)) return getHexColor(k, bg)

      // 其它
      else return raw // 用户可以自己直接写 ASCII 编码
    })
    .map(function(n) {
      return n == null || n === '' ? '' : PREFIX + n + SUFFIX
    })
    .join('')
    /* eslint-enable no-multi-spaces, brace-style */
}

function getHexColor(hex, bg) {
  return (bg ? '48;5;' : '38;5;') + hexToRGB5(hex)
}
function hexToRGB5(hex) {
  var rgb, gap
  gap = hex.length === 3 ? 1 : 2
  rgb = [
    hex.substring(0, gap),
    hex.substring(gap, gap * 2),
    hex.substring(gap * 2, gap * 3)
  ].map(mapHexToInt5)

  return 16 + rgb[0] * 36 + rgb[1] * 6 + rgb[2]
}
function mapHexToInt5(hex) {
  return hexToInt5(hex.length === 1 ? hex + hex : hex)
}
function hexToInt5(hex) {
  return Math.round((parseInt(hex, 16) || 0) * 5 / 255)
}
