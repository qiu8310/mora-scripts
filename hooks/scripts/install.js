#!/usr/bin/env node

var fs = require('fs')
var resolve = require('path').resolve
var findup = require('../../libs/fs/findup')
var warn = require('../../libs/sys/warn')

var config = require('./config')
var template = fs.readFileSync(resolve(__dirname, 'template.js'))
var reTemplate = /Generated by mora-scripts\. Do not edit this file\./

var args = process.argv.slice(2).join(',')
if (/reverse|uninstall/.test(args)) {
  console.log('========= UNINSTALL HOOKS =========')
  uninstall()
} else {
  console.log('========= INSTALL HOOKS =========')
  install()
}

function install() {
  var gitDir
  try {
    gitDir = findup.git()
    config.hooks.forEach(installHook.bind(null, resolve(gitDir, 'hooks')))
  } catch (e) {
    warnAboutGit()
  }
}

function uninstall() {
  try {
    var gitDir = findup.git()
    config.hooks.forEach(uninstallHook.bind(null, resolve(gitDir, 'hooks')))
  } catch (e) {}
}

function installHook(dir, file) {
  var filepath = resolve(dir, file)
  if (!isHookTemplateFile(filepath)) {
    console.log('  install hook ' + file)
    backup(filepath)
    fs.writeFileSync(filepath, template)
    fs.chmodSync(filepath, '755')
  } else {
    console.log('  update hook ' + file)
    fs.writeFileSync(filepath, template) // 更新原来的文件
  }
}

function uninstallHook(dir, file) {
  var filepath = resolve(dir, file)
  if (isHookTemplateFile(filepath)) {
    console.log('  uninstall hook ' + file)
    restore(filepath)
  }
}

function isHookTemplateFile(filepath) {
  try {
    return reTemplate.test(fs.readFileSync(filepath).toString())
  } catch (e) { return false }
}

function warnAboutGit() {
  warn(
    '\nThis does not seem to be a git project.\n'
    + '===========================================================\n\n'
    + 'Although mora-scripts was installed, the actual hooks have not.\n'
    + 'Please run the following command manually:\n\n'
    + '\tgit init\n'
    + '\tnpm explore mora-scripts -- npm run postinstall\n\n'
    + 'Please ignore this message if you are not using mora-scripts/hooks directly.\n'
  )
}

function exists(filepath) {
  try {
    return fs.statSync(filepath).isFile()
  } catch (e) {
    return false
  }
}

function backup(filepath) {
  rename(filepath, filepath + '.bkp')
}

function restore(filepath) {
  rename(filepath + '.bkp', filepath)
}

function rename(from, to) {
  if (exists(to)) fs.unlinkSync(to)
  if (exists(from)) fs.renameSync(from, to)
}
