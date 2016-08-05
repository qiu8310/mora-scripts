#!/usr/bin/env node
require = require('./require')

const path = require('path')

const inquirer = require('inquirer')
const cli = require('mora-scripts/libs/tty/cli')
const exists = require('mora-scripts/libs/fs/exists')
const helper = require('./cli-helper')

const SCAFFOLD_DIR = path.resolve(__dirname, '..')

cli({
  usage: 'boilerplate <scaffold>',
  version: require('../package').version,
  epilog: 'Copyright Mora'
})
.options({
  's | skipValidatePkgName': '<boolean> do not validate package name in npm registry'
})
.commands({
  'u | update': {
    desc: 'update local npm package names',
    cmd () {
      let cp = require('child_process')
      process.chdir(SCAFFOLD_DIR)
      console.log('running `npm update` in boilerplates directory')
      cp.spawn('npm', ['update'], { stdio: 'inherit' })
    }
  }
})
.parse(function (res) {
  if (checkArguments.call(this, res) !== true) return

  let scaffold = res._[0]
  let app = {}
  try { app = require('../' + scaffold + '/__app') } catch (e) {}
  let callHookOnApp = hook.bind(null, app)

  inquirer
    .prompt(callHookOnApp('onQuestions', require('./cli-questions')(res)))
    .then(answers => {
      callHookOnApp('onAnswers', app, answers)
      helper.copy(path.join(SCAFFOLD_DIR, scaffold), process.cwd(), answers)
    })
})

/**
 * 检查 cli 的参数是否正常
 * @private
 * @param  {Object} res
 */
function checkArguments (res) {
  if (res._.length === 0) return this.error('expect <scaffold> name')
  if (res._.length !== 1) return this.error('expect only one <scaffold> name')

  let scaffold = res._[0]
  let isDirInternal = ['common', 'scripts'].indexOf(scaffold) >= 0
  let isDirExists = exists(path.join(SCAFFOLD_DIR, scaffold), 'Directory')

  if (isDirInternal || !isDirExists) {
    return this.error('scaffold <' + scaffold + '> not exists')
  }

  return true
}

/**
 * 调用具体脚手架里的函数
 * @private
 */
function hook (app, key, obj) {
  if (typeof app[key] === 'function') {
    let rtn = app[key](obj)
    if (typeof rtn === typeof obj) return rtn
  }
  return obj
}
