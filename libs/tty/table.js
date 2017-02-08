/**
 * @module      libs/tty/table
 * @createdAt   2016-07-19
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var punycode = require('punycode')
var os = require('os')
var cliTextSize = require('./cliTextSize')
var greAnsi = require('./stripAnsi').gre

var encode = punycode.ucs2.encode
var decode = punycode.ucs2.decode

// 获取当前屏幕的宽度
var stream = process.stdout
var MIN_OVERFLOW_CELL_WIDTH = 10
var SCREEN_WIDTH = 120

/* istanbul ignore else */
if (stream.getWindowSize && !process.env.CI) SCREEN_WIDTH = stream.getWindowSize()[0] // 在 CI 中以 120 为准，travis 中只有 32，导致很多输出断行了，很多测试失败

/**
 * 将一个二维的字符串数组，转化成一个 table 格式的字符串，方便在终端上显示，主要特点有：
 *
 * 1. 精确计算字符的宽度，自动换行：很多老外写的类似的库都采用 str.length 来得到字符串在终端上的显示长度，
 *    但是，中文在终端上一般占用两个字符，而且不同系统上字符长度也会不一样
 * 2. 自动重置颜色：当一个 cell 中有颜色时，如果不重置色值，它是会影响后面 cell 的
 * 3. 判断是否超出屏幕大小：如果超出，自动截断最宽的一行
 *
 * @param  {Array<Array<String>>} rows  table 中每个 cell 中的字符串，是个二维的字符串数组
 * @return {String}               table 化的字符串
 *
 * @example
 *
 * table([
 *   ['a', 'b', 'c'],
 *   ['d', 'ee', 'f']
 * ])
 *
 * // ab c
 * // deef
 *
 * @see [tty-wrap@0.1.0]{@link https://github.com/qiu8310/tty-wrap/tree/0.1.0}
 * @since  2.0.0
 * @author Zhonglei Qiu
 */
module.exports = function(rows) {
  if (!Array.isArray(rows) || !Array.isArray(rows[0]) || !rows[0].length) return ''

  var maxCellHeights = new Array(rows.length)  // 同一行中， cell 占位最多的高度

  // 初始化
  each(rows, function(val, opt) {
    rows[opt.r][opt.c] = val = val.replace(/[\r\v\f]/g, '').replace(/\t/g, '    ').split(/\n/)
    maxCellHeights[opt.r] = Math.max(maxCellHeights[opt.r] || 0, val.length)
  })

  var maxColumnWidths = getMaxWidthsOfEachColumn(rows)
  var sumwidth = sum(maxColumnWidths)

  // 处理宽度最宽的一列的宽度（不能超过屏幕）
  if (sumwidth > SCREEN_WIDTH) {
    var maxindex = maxNumberIndex(maxColumnWidths)
    var limit = Math.max(MIN_OVERFLOW_CELL_WIDTH, SCREEN_WIDTH - (sumwidth - maxColumnWidths[maxindex])) // 保证不要小于 0
    maxColumnWidths[maxindex] = limit
    each(rows, function(val, opt) {
      if (opt.c === maxindex) {
        rows[opt.r][opt.c] = val = wrapCell(val, limit)
        maxCellHeights[opt.r] = Math.max(maxCellHeights[opt.r], val.length)
      }
    })
  }

  // 保证每个 cell 的宽度和高度一致
  each(rows, function(val, opt) {
    var i
    var l = val.length

    // 统一高度
    for (i = 0; i < maxCellHeights[opt.r] - l; i++) {
      val.push('')
    }

    // 统一宽度
    val.forEach(function(str, j) {
      val[j] = str + space(maxColumnWidths[opt.c] - cliTextSize(str))
    })

    // 保证 cli 上的颜色不要互相污染
    rows[opt.r][opt.c] = wrapColor(val)
  })

  // 组装
  var r, c, j, row
  var result = []

  for (r = 0; r < rows.length; r++) {
    for (j = 0; j < maxCellHeights[r]; j++) {
      row = []
      for (c = 0; c < rows[r].length; c++) {
        row.push(rows[r][c][j])
      }
      result.push(row.join(''))
    }
  }

  return result.join(os.EOL)
}

// 限制 cell 的宽度，过长就将它裁断
function wrapCell(cell, size) {
  var res = []
  cell.forEach(function(str) {
    if (cliTextSize(str) > size) {
      res.push.apply(res, wrapStr(str, size))
    } else {
      res.push(str)
    }
  })
  return res
}

// 限制 string 的宽度，过长就将它裁断
function wrapStr(str, size) {
  var rows = []
  var ansis = []

  // str 中可能包含 ansi 控制字符
  // 要先备份其位置
  str = str.replace(greAnsi, function(ansi, i) {
    ansis.push([i, ansi])
    return ''
  })

  var data = []
  var cps = decode(str)

  cps.forEach(function(cp, i) {
    var char = encode([cp])
    data.push({
      char: char,
      size: cliTextSize(char)
    })
  })

  var i, ansi, ai
  var len = 0
  var fetchAnsi = function() {
    var t = ansis.shift()
    ai = t && t[0]
    ansi = t && t[1]
  }

  str = ''
  fetchAnsi()
  for (i = 0; i < data.length; i++) {
    if (len + data[i].size > size) {
      rows.push(str)
      str = ''
      len = 0
    }
    if (ansi && ai === i) {
      str += ansi
      fetchAnsi()
    }
    str += data[i].char
    len += data[i].size
  }

  /* istanbul ignore else */
  if (str) rows.push(str)
  if (ansi) rows[rows.length - 1] += ansi
  return rows
}

// 保证 cli 上的颜色不要互相污染
function wrapColor(cell) {
  var hasAnsi
  var stack = ''
  var res = []
  cell.forEach(function(str) {
    var prevStack = stack
    str.replace(greAnsi, function(ansi) {
      hasAnsi = true
      stack += ansi
    })
    if (hasAnsi) str += '\x1b[0m'
    res.push(prevStack + str)
  })
  return res
}

function each(data, fn) {
  var r, c
  var rowSize = data.length
  var colSize = data[0].length

  for (r = 0; r < rowSize; r++) {
    for (c = 0; c < colSize; c++) {
      fn(data[r][c], {r: r, c: c})
    }
  }
}

// 获取每列中宽度最大的值
function getMaxWidthsOfEachColumn(rows) {
  var result = new Array(rows[0].length)
  each(rows, function(cell, opt) {
    result[opt.c] = Math.max(result[opt.c] || 0, getCellWidth(cell))
  })
  return result
}

function getCellWidth(cell) {
  return Math.max.apply(Math, cell.map(cliTextSize))
}

function space(n) {
  if (n < 1) return ''
  return new Array(n + 1).join(' ')
}

function sum(arr) {
  return arr.reduce(function(s, i) {
    return s + i
  }, 0)
}

function maxNumberIndex(arr) {
  var i
  var max = 0
  var res = -1
  for (i = 0; i < arr.length; i++) {
    if (arr[i] >= max) { // 优先取最后的最大值
      max = arr[i]
      res = i
    }
  }
  return res
}

