
var extend = require('./extendFormat')
var clog = require('./color')
var cliTextSize = require('../tty/cliTextSize')

var format = xlog.format = extend([
  clog.colorMatcher,
  {
    match: /%\d+\.?(?:\d+)?s/,
    handle: alignString
  }
])


Object.defineProperties(xlog, {
  autoResetAtEnd: {
    enumerable: true,
    configurable: true,
    set: function (val) { clog.autoResetAtEnd = !!val },
    get: function () { return clog.autoResetAtEnd }
  },
  autoResetAtFormated: {
    enumerable: true,
    configurable: true,
    set: function (val) { clog.autoResetAtFormated = !!val },
    get: function () { return clog.autoResetAtFormated }
  }
})


// %3s    =>  至少有3个字符，没有的话在左边补空格
// %.3s   =>  至少3个字符，没有的话在右边补空格
// %1.2s  =>  至少3个字符，不足的话左右两边填充，先填左，再填右，再填右
function alignString(val, format) {
  var left, right, diff, space = ' ', flag = true, i
  format = format.slice(1, -1).split('.')

  left =  parseInt(format[0] || '0', 10)
  right = parseInt(format[1] || '0', 10)

  if (left === 0 && right === 0) return val

  diff = left + right - cliTextSize(val)

  if (diff <= 0) return val

  for (i = 0; i < diff; i++) {
    if (flag && left > 0) {
      val = space + val
      left--
    } else {
      val += space
      right--
    }
    flag = !flag
  }

  return val
}


module.exports = xlog

function xlog() {
  console.log(format.apply(null, arguments))
}