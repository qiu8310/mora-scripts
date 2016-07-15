var hasAnsiColorRegExp = require('../tty/stripAnsi').gre

var bgRE = /^(?:bg|background)(\w+)$/       // match:  bgRed, bgYellow ...
var resetModifRE = /^(?:r|reset)(\w+)$/     // match:  resetDim, resetItalic ...
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

var NAMED_COLORS = {
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

  // 30-37 color;                   40-47 background
  // 90-97 high intensity color;  100-107 high intensity background
  //
  // 注意： windows 下 high intensity black + dim 会导致文字不显示 （ high intensity black 和 dim 都是灰色 ）
  // SEE： https://github.com/chalk/chalk/issues/58
var NAMES = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']

  // 其它
  // 39 => default color;
  // 49 => default background;
  // 0  => reset

var ansiStack = []
var reset = function () { ansiStack.length = 0; return RESET }
var colorMatcher = {
  match: /%c/,
  handle: function (color) {
    var ansi = parseColor(color)
    var i = ansi.indexOf(RESET)
    if (i >= 0) {
      reset()
      ansi = ansi.substr(i)
    }
    ansiStack.push(ansi)
    return ansi
  },
  onEnd: function () {
    return clog.autoResetAtEnd ? reset() : ''
  },
  onGroupEnd: function () {
    return clog.autoResetAtFormated ? reset() : ''
  },
  onFormatEnd: function (arg) {
    if (this !== arg.matcher) {
      var value = arg.value
      if (typeof value === 'string' && hasAnsiColorRegExp.test(value) && ansiStack.length) {
        return RESET + ansiStack.join('')
      }
    }
  }
}

// util.format 支持 %s %d %j %% 四个参数
// 此函数比 util.format 多个 %c 参数
//
// format('Are %cyou%c ok', 'color.red.bg.yellow', 'color.reset');
var format = require('./extendFormat')(colorMatcher)

// 是否在 console.log 的结尾重置颜色
clog.autoResetAtEnd = true

// 是否在每将 format 完一轮之后就重置颜色
//
// 这里解释一下，拿语句 console.log('Are %s ok', 'you', 'I am %s', 'ok') 来说
// 上面是有两个模板的：
//    - Are %s ok
//    - I am %s
// 如果将下面的 bool 设置成 true，则上面每个模板替换完之后都会 reset 一下
clog.autoResetAtFormated = true

// 暴露给外面，使第三方可以修改它
clog.NAMED_COLORS = NAMED_COLORS

clog.format = format
clog.colorMatcher = colorMatcher // 提供给 xlog.js 使用
clog.parseColor = parseColor

// clog('%caaaa %s cccc', 'red', '\x1b[35mbbbbb', 'dddd')
// clog('eeee')

module.exports = clog

function clog () {
  console.log(format.apply(null, arguments))
}

// c. 或者 color. 表示设置前景色
// b. bg. 或者 background. 表示设置背景色
// h. l. 或者 high. low. 可以设置成使用 high intensity 相关的颜色
// 每次切换 color 或者 background 都会自动将 high 设置成 false (high intensity color 兼容性不好)
// 而 MODIFIERS 可以随便加，不加前缀时默认使用 color.
function parseColor (color) {
  color = String(color)

  var bg = false
  var high = false
  var getNamedColorValue = function (key, forceBG) {
    return (high ? 60 : 0) + (bg || forceBG ? 40 : 30) + NAMES.indexOf(key)
  }

  /* eslint-disable no-multi-spaces, brace-style */
  return color
    .split(/[\{\}#\.,:;\s]+/)
    .map(function (raw) {
      var k = raw.toLowerCase()

      // 空字符串
      if (!k) return

      // 重置
      else if (k === 'reset' || k === 'end') return 0

      // 修改状态
      else if (k === 'h' || k === 'high')                       { high = true  }
      else if (k === 'l' || k === 'low')                        { high = false }
      else if (k === 'c' || k === 'color')                      { high = false; bg = false }
      else if (k === 'b' || k === 'bg' || k === 'background')   { high = false; bg = true  }

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
    .map(function (n) {
      return n == null || n === '' ? '' : PREFIX + n + SUFFIX
    })
    .join('')
    /* eslint-enable no-multi-spaces, brace-style */
}

function getHexColor (hex, bg) {
  return (bg ? '48;5;' : '38;5;') + hexToRGB5(hex)
}
function hexToRGB5 (hex) {
  var rgb, gap
  gap = hex.length === 3 ? 1 : 2
  rgb = [
    hex.substring(0, gap),
    hex.substring(gap, gap * 2),
    hex.substring(gap * 2, gap * 3)
  ].map(mapHexToInt5)

  return 16 + rgb[0] * 36 + rgb[1] * 6 + rgb[2]
}
function mapHexToInt5 (hex) {
  return hexToInt5(hex.length === 1 ? hex + hex : hex)
}
function hexToInt5 (hex) {
  return Math.round((parseInt(hex, 16) || 0) * 5 / 255)
}
