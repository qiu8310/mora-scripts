var table = require('./libs/tty/table')
var format = require('./libs/sys/clog').format

var redText = format('%c%s', 'red', 'text')

// 运行 node manual.test.js -h
// 调整终端宽度，使得显示成两行，不希望看到 `[ default: "are you ok" ]` 的颜色错乱了
var cli = require('./libs/tty/cli')
cli({
  version: false
}).options({
  'test': '<boolean> long long ' + redText + ' long long long{{ "are you ok" }}'
}).parse()

console.log(table([
  [
    '\x1B[39m long long long ' + redText + ' long long long long long \x1B[2m[ default: "are you ok" ]\x1B[0m'
  ]
]))
