// tty-wrap 的一个精简版
var punycode = require('punycode')
var os = require('os')
var cliTextSize = require('./cliTextSize')
var greAnsi = require('./stripAnsi').gre

var encode = punycode.ucs2.encode
var decode = punycode.ucs2.decode

// 获取当前屏幕的宽度
var stream = process.stdout
var SCREEN_WIDTH = 120
if (stream.getWindowSize) SCREEN_WIDTH = stream.getWindowSize()[0]

/*
  n 列宽度如果大于 SCREEN_WIDTH，则最宽的一列自动适应
 */
module.exports = function (rows) {
  if (!rows || !rows.length || !rows[0].length) return '';

  var maxCellHeights = new Array(rows.length)  // 同一行中， cell 占位最多的高度

  // 初始化
  each(rows, function (val, opt) {
    rows[opt.r][opt.c] = val = val.replace(/[\r\v\f]/g, '').replace(/\t/g, '    ').split(/\n/)
    maxCellHeights[opt.r] = Math.max(maxCellHeights[opt.r] || 0, val.length)
  })

  var maxColumnWidths = getMaxWidthsOfEachColumn(rows)
  var sumwidth = sum(maxColumnWidths)

  // 处理宽度最宽的一列的宽度（不能超过屏幕）
  if (sumwidth > SCREEN_WIDTH) {
    var maxindex = maxNumberIndex(maxColumnWidths)
    var limit = Math.max(10, SCREEN_WIDTH - (sumwidth - maxColumnWidths[maxindex])) // 保证不要小于 0
    maxColumnWidths[maxindex] = limit
    each(rows, function (val, opt) {
      if (opt.c === maxindex) {
        rows[opt.r][opt.c] = val = wrapCell(val, limit)
        maxCellHeights[opt.r] = Math.max(maxCellHeights[opt.r], val.length)
      }
    })
  }

  // 保证每个 cell 的宽度和高度一致
  each(rows, function (val, opt) {
    var i, l = val.length

    // 统一高度
    for (i = 0; i < maxCellHeights[opt.r] - l; i++) {
      val.push('')
    }

    // 统一宽度
    val.forEach(function (str, j) {
      val[j] = str + space(maxColumnWidths[opt.c] - cliTextSize(str))
    })

    // 保证 cli 上的颜色不要互相污染
    rows[opt.r][opt.c] = wrapColor(val)
  })

  // 组装
  var r, c, j, result = [], row

  for (r = 0; r < rows.length; r++) {
    for (j = 0; j < maxCellHeights[r]; j++) {
      row = []
      for (c = 0; c < rows[r].length; c++) {
        row.push(rows[r][c][j])
      }
      result.push(row.join(''))
    }
  }

  return result.join(os.EOL);
}


// 限制 cell 的宽度，过长就将它裁断
function wrapCell(cell, size) {
  if (size <= 0) return cell;

  var res = []
  cell.forEach(function (str) {
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
  var rows = [], ansis = []

  // str 中可能包含 ansi 控制字符
  // 要先备份其位置
  str = str.replace(greAnsi, function (ansi, i) {
    ansis.push([i, ansi])
    return ''
  })

  var data = [], cps = decode(str);

  cps.forEach(function (cp, i) {
    var char = encode([cp])
    data.push({
      char: char,
      size: cliTextSize(char)
    })
  })

  var i, str = '', len = 0, ansi, ai;
  var fetchAnsi = function () { var t = ansis.shift(); ai = t && t[0]; ansi = t && t[1]; }
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
    str +=  data[i].char
    len += data[i].size
  }

  if (str) rows.push(str)
  if (ansi) rows[rows.length - 1] += ansi
  return rows
}

// 保证 cli 上的颜色不要互相污染
function wrapColor(cell) {
  var stack = ''
  var res = []
  cell.forEach(function (str) {
    var hasAnsi, lastStack = stack
    str.replace(greAnsi, function (ansi) {
      hasAnsi = true
      stack += ansi
    })
    if (hasAnsi) str += '\x1b[0m'
    res.push(lastStack + str)
  })
  return res
}


function each(data, fn) {
  var r, c;
  var rowSize = data.length;
  var colSize = data[0].length;

  for (r = 0; r < rowSize; r++) {
    for (c = 0; c < colSize; c++) {
      fn(data[r][c], {r: r, c: c})
    }
  }
}

// 获取每列中宽度最大的值
function getMaxWidthsOfEachColumn(rows) {
  var result = new Array(rows[0].length)
  each(rows, function (cell, opt) {
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
  return arr.reduce(function (s, i) {
    return s + i
  }, 0)
}

function maxNumberIndex(arr) {
  var i, max = 0, res = -1
  for (i = 0; i < arr.length; i++) {
    if (arr[i] >= max) { // 优先取最后的最大值
      max = arr[i]
      res = i
    }
  }
  return res
}

