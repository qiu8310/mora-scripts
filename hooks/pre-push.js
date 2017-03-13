#!/usr/bin/env node

// 检查 lint
// 检查 test

var findup = require('../libs/fs/findup')
var shell = require('../libs/tty/shell')
var info = require('../libs/sys/info')
var scripts = require(findup.pkg()).scripts

var checks = ['lint', 'hint', 'test']
var cmds = []

checks.forEach(function(key) {
  if (key in scripts) cmds.push('npm run ' + key)
})

// Promise.all 是并行的，这里本来需要串行
// 但 Promise.all 中只要有一个命令执行失败，整个就失败了，所以和串行差不多
// 再说 lint 和 test 也不需要强制先后执行
Promise.all(cmds.map(run))
  .then(function() {
    process.exit(0)
  })
  .catch(function(code) {
    process.exit(code)
  })

function run(cmd) {
  return new Promise(function(resolve, reject) {
    console.log('Running %s...', info.format(cmd))
    shell(cmd, {stdio: 'inherit'}).on('exit', function(code, signal) {
      if (code === 0 && !signal) resolve()
      else reject(signal ? -1 : code)
    })
  })
}
