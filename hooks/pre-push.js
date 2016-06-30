#!/usr/bin/env node

// 检查 lint
// 检查 test

var findup = require('../libs/fs/findup')
var shell = require('../libs/tty/shell')
var scripts = require(findup.pkg()).scripts

var checks = ['lint', 'hint', 'test']
var cmds = []

checks.forEach(function (key) {
  if (key in scripts) cmds.push('npm run ' + key)
})

Promise.all(cmds.map(run))
  .then(function () {
    process.exit(0)
  })
  .catch(function (code) {
    process.exit(code)
  })

function run(cmd) {
  return new Promise(function (resolve, reject) {
    shell(cmd, {stdio: 'inherit'}).on('exit', function (code, signal) {
      if (code === 0 && !signal) resolve()
      else reject(signal ? -1 : code)
    })
  })
}
