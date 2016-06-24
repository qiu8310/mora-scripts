var assert = require('assert');
var format = require('util').format;

var stripAnsi = require('../libs/stripAnsi');
var color = require('../libs/color');
var nocolor = function () {
  return stripAnsi(color.format.apply(null, arguments));
}


// 原有功能测试
var testNativeArgsGroup = [
  [],
  ['a', 'b'],
  ['aaaaaaaaa'],
  ['aaa', 'red', '  hah'],
  [['a', '%%c', 'b'], ['a', '%%c', 'b']],
  [0, 2, 3, null, false],
  ['%s %d %j %%', 'aa', 12, {a: true}, 'no', true]
]
testNativeArgsGroup.forEach(function (args) {
  assert.equal(nocolor.apply(null, args), format.apply(null, args));
})


// Color 功能
var testColorArgsGroup = [
  [['%ctitle', 'red', 'aa', true], ['title', 'aa', true]],
  [['%ca %cb c', 'red', 'c.h.green; bg.cyan'], ['a b c']],
  [['%%c'], ['%%c']],
  [['%%c', 'd'], ['%c', 'd']]
]
testColorArgsGroup.forEach(function (args) {
  assert.equal(nocolor.apply(null, args[0]), format.apply(null, args[1]));
})


// 如果没有第二个参数，则 %% 不会转义成单个 %
assert.equal(nocolor('%%c'), '%%c');
assert.equal(nocolor('%%c', 'b'), '%c b');


color('%cTest libs/color OK', 'c.green.bold');

