#!/usr/bin/env node

var spawn = require('cross-spawn')
var isCommandExists = require('../libs/tty/isCommandExists')

var git = spawn(
  'git',
  [
    'diff-tree',
    '-r',
    '--name-only',
    '--no-commit-id',
    'HEAD@{1}', // HEAD@{1} is always last value of HEAD, ORIG_HEAD is last value of HEAD before dangerous operation
    'HEAD'
  ]
)

git.stdout.on('data', function(data) {
  var files = data.toString().trim().split(/[\r\n]+/)

  checkRun('package.json', isCommandExists('yarn') ? 'yarn install' : 'npm install')
  checkRun('bower.json', 'bower install')
  checkRun('composer.json', 'composer install')

  function checkRun(file, cmd) {
    if (files.indexOf(file) >= 0) syncRun(cmd.trim().split(/\s+/))
  }
})

git.stderr.on('data', onerror)

function onerror(data) {
  console.error(data.toString())
}

function syncRun(cmds) {
  cmds = [].concat(cmds)
  console.log('\npost-merge execute: %s \n', cmds.join(' '))

  var cmd = cmds.shift()
  var args = cmds

  spawn.sync(cmd, args || [], {stdio: 'inherit'})
}
