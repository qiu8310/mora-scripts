/**
 * @module      libs/sys/cli
 * @createdAt   2016-07-15
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var format = require('../sys/clog').format
var table = require('./table')
var assign = require('../lang/assign')
var isPlainObject = require('../lang/isPlainObject')
var reOptionType = /^(bool|str|num|arr|count)[a-z]*$/
var reOption = /^\s*<(bool|str|num|arr|count)[a-z]*>\s*([\s\S]*?)(?:\{\{(.*)\}\})?$/
var undef = void 0
var DEFAULT_GROUP_NAME = '__default__:)'

var typeConfig = {
  bool: {
    label: 'boolean',
    needArgs: 0,
    needArgsWhenUseEqual: 1
  },
  str: {
    label: 'string',
    needArgs: 1
  },
  num: {
    label: 'number',
    needArgs: 1
  },
  arr: {
    label: 'array',
    needArgs: 1
  },
  count: {
    label: 'count',
    needArgs: 0
  }
}

/**
 * @class
 * @param {Object} conf  cli 程序的配置项
 * @param {String|Boolean} conf.help                              String: 帮助描述              Boolean: 是否启用系统默认的帮助选项
 * @param {String|Boolean|(() => String} conf.version             String: 版本号（默认为 0.0.0） Boolean: 是否启用系统默认的版本选项
 * @param {String|(() => String} conf.usage                       简短的描述
 * @param {String|Array<String>|(() => String} conf.desc          命令的一些介绍
 * @param {String|Array<String>|(() => String} conf.example       使用命令的一些样例
 * @param {String|(() => String} conf.epilog                      放在 help 结尾的一段话，一般用来声明版权，或者显示查看更多的链接
 *
 * @param {Boolean} conf.strict                     遇到无法解析的 option 是否要报错
 * @param {Boolean} conf.showHelpOnError            解析参数失败时不显示帮助信息
 * @param {Boolean} conf.stopParseOnFirstNoOption   在遇到第一个非 option 参数时就停止解析（很适用于运行子程序）
 *
 * @example
 * cli({
 *   usage: 'cli [options] <foo>'
 *   version: '1.0.0'
 * })
 * .options({
 *   'e | escape': '<bool> escape input string {{ defaultValue }}'
 * })
 * .parse(function (res) {
 *   if (res.escape) {
 *     // ...
 *   }
 * })
 *
 * @author Zhonglei Qiu
 * @since  2.0.0
 * @see    optimist, minimist, yargs, nomnom, nopt, commander
 */
function Cli(conf) {
  if (!(this instanceof Cli)) return new Cli(conf)

  /**
   * 配置信息
   * @type {Object}
   */
  this.conf = conf || {}
  conf = this.conf

  /**
   * 在遇到第一个非 option 参数时就停止解析（很适用于子程序）
   * @type {Boolean}
   */
  this.stopParseOnFirstNoOption = !!conf.stopParseOnFirstNoOption

  /**
   * 出错时显示帮助信息
   * @type {Boolean}
   */
  this.showHelpOnError = !!conf.showHelpOnError

  /**
   * 严格模式，遇到无法解析的 option 是就报错
   * @type {Boolean}
   */
  this.strict = !!conf.strict

  /**
   * 解析完后剩下的给程序的参数
   * @type {Array}
   */
  this._ = []

  /**
   * 所有 commands 的配置
   * @type {Object}
   */
  this.mapCommands = {}

  /**
   * 所有 options 的配置
   * @type {Object}
   */
  this.mapOptions = {}

  /**
   * 所有的分组名称
   * @type {Array}
   */
  this.groups = []
  this.groupsMap = {}

  if (conf.usage) this.usage = conf.usage
  if (conf.desc) this.desc = [].concat(conf.desc)
  if (conf.example) this.example = [].concat(conf.example)
  if (conf.epilog) this.epilog = conf.epilog
}

/**
 * 设置 Cli 程序的子命令
 *
 * @param  {Object} opts 子命令配置
 *
 *   opts 是 key-value 对象，支持下面几种类型的配置
 *   - str1:str2... => function
 *   - str1:str2... => {desc: '', cmd: function}
 *
 * @return {Cli}
 *
 * @example
 *
 * cli.commands({
 *   'build:*': function (res) {
 *      // 匹配所有 build: 开头的子命令
 *    },
 *   'r | run': function (res) {
 *     // handle
 *   },
 *   second: {
 *     desc: 'this is sub-command with description',
 *     cmd: function (res) {
 *       // handle
 *     }
 *   }
 * })
 *
 */
Cli.prototype.commands = function(opts) {
  init.call(this, true, opts)
  return this
}

/**
 * 设置 Cli 程序支持的选项
 *
 * @param  {String} [group]     选项可以分组，此值可以指定分组的名称，在选项非常多的情况下，
 *                              使用 --help 时可以看到效果
 *
 * @param  {Object} opts        此分组下的所有选项
 *
 * opts 是 key-value 对象，支持下面几种类型的配置
 *   - str1:str2... => <type> desc
 *   - str1:str2... => {type: '', desc: '', defaultValue: ''}
 *
 * 说明：
 *   1. str1 是一个 option，":" 后面的 str2 等等表示 str1 的别名
 *   2. desc 表示 option 的描述
 *   3. type 表示 option 的类型，支持的类型有
 *     * boolean   bool
 *     * string    str   不能为空
 *     * number    num   不能为空
 *     * array     arr   可以为空
 *     * count
 *
 * @return {Cli}
 *
 * @example
 *
 * cli.options({
 *   'e | escape': '<boolean> enable escape',
 *   'l | linefeed': {
 *     type: 'boolean',
 *     desc: 'append a system linefeed at end'
 *   }
 * })
 *
 */
Cli.prototype.options = function(group, opts) {
  if (typeof group !== 'string') {
    opts = group
    group = null
  }
  if (!opts) return
  init.call(this, false, opts, group)
  return this
}

function init(isCommand, opts, group) {
  Object.keys(opts).forEach(function(origKey) {
    var key, type, value, cmd, desc, alias, defaultValue, target, map

    alias = origKey.trim().split(/\s*\|\s*/).sort()
    key = alias[0]
    value = opts[origKey]

    if (isCommand) {
      if (typeof value === 'function') {
        cmd = value
        desc = ''
      } else if (isPlainObject(value)) {
        cmd = value.cmd
        if (typeof cmd !== 'function') {
          throw new Error('Command "' + origKey + '" should have a handle function.')
        }

        desc = value.desc || ''
        if (value.conf || value.options || value.groups) {
          /* istanbul ignore next */
          var conf = value.conf || {}

          /* istanbul ignore else */
          if (!conf.desc) conf.desc = desc

          var subCli = new Cli(conf)
          subCli.options(value.options)
          /* istanbul ignore else */
          if (value.groups) {
            Object.keys(value.groups).forEach(function(k) {
              subCli.options(k, value.groups[k])
            })
          }
          cmd = function(res, cli) {
            subCli.parse(res._, function(subres) {
              value.cmd.call(subCli, subres, subCli)
            })
          }
        }
      } else {
        throw new Error('Command "' + origKey + '" is invalid')
      }

      target = { key: key, alias: alias, cmd: cmd, type: 'command', desc: desc }
      map = this.mapCommands
    } else {
      if (typeof value === 'string') {
        if (reOption.test(value)) {
          type = RegExp.$1
          desc = RegExp.$2
          if (RegExp.$3) {
            defaultValue = RegExp.$3
            try {
              defaultValue = JSON.parse(defaultValue.trim())
            } catch (e) {
              desc += '{{' + defaultValue + '}}'
              defaultValue = undefined
            }
          }
        } else {
          throw new Error('Option "' + origKey + '" config "' + value + '" is invalid.')
        }
      } else if (isPlainObject(value)) {
        type = value.type
        desc = value.desc || ''
        defaultValue = value.defaultValue

        if (reOptionType.test(type)) {
          type = RegExp.$1
        } else {
          throw new Error('Option "' + origKey + '" type is invalid.')
        }
      } else {
        throw new Error('Option "' + origKey + '" is invalid.')
      }

      group = group || DEFAULT_GROUP_NAME
      target = { key: key, alias: alias, defaultValue: defaultValue, type: type, group: group, desc: desc }
      map = this.mapOptions
      if (this.groups.indexOf(group) < 0) {
        if (group === DEFAULT_GROUP_NAME) {
          this.groups.unshift(group)
        } else {
          this.groups.push(group)
        }
        this.groupsMap[group] = []
      }
      this.groupsMap[group].push(target)
    }

    alias.forEach(function(k) {
      if (k in map) throw new Error((isCommand ? 'Command' : 'Option') + ' key "' + k + '" is duplicated.')
      map[k] = target
    })
  }, this)
}

// 确保将 -h, -v 放在 default group 的最后面
function parseInit() {
  var conf = this.conf
  var opts = {}
  if (conf.help !== false) {
    opts['help | h'] = '<bool> ' + (typeof conf.help === 'string' ? conf.help : 'show help')
  }
  if (conf.version !== false) {
    this.version = conf.version
    opts['version | v'] = '<bool> ' + 'show version'
  }
  init.call(this, false, opts)
}

function parse(args) {
  var _ = this._
  var i, arg, rawArg, stopped
  var ck = consumeKey.bind(this)
  var cv = consumeVal.bind(this)

  for (i = 0; i < args.length; i++) {
    rawArg = arg = args[i]

    if (stopped) {
      _.push(arg)
    } else if (_.length === 0 && arg in this.mapCommands) { // 运行子命令剩下的参数给子命令去解析
      stopped = true
      _.push(arg)
    } else if (arg === '--') {
      stopped = true
    } else {
      var equalValue
      var equalIndex = arg.indexOf('=')
      if (equalIndex >= 0) {
        equalValue = arg.substr(equalIndex + 1)
        arg = arg.substr(0, equalIndex)
      }

      if (arg.slice(0, 2) === '--') { // 长参数
        if (arg.length === 3) { // --a 类的参数不是 option，需要当作 value
          cv(rawArg)
        } else {
          ck(arg.slice(2), undefined, equalValue)
          if (equalValue != null) cv(equalValue, true)
        }
      } else if (arg[0] === '-' && arg.length === 2) { // 单个短参数
        ck(arg[1], undefined, equalValue)
        if (equalValue != null) cv(equalValue, true)
      } else if (arg[0] === '-' && arg.length >= 3) { // 多个短参数，或单个数字短参数
        // 这里的参数被打散处理了，所以 consume 前要先 check 整体参数是否 valid
        if (/^-\w(\d+)$/.test(arg)) {
          if (checkOpt.call(this, arg[1], rawArg)) {
            // 已经赋值，不应该再赋值
            if (equalValue != null) throw new Error('Error: can not parse arg "' + rawArg + '"')
            ck(arg[1])
            cv(arg.slice(2))
          }
        } else {
          arg = arg.slice(1).split('')
          if (checkOpt.call(this, arg, rawArg)) {
            arg.forEach(function(k, i, ref) {
              if (ref.length - 1 === i) {
                ck(k)    // 最后一个 option 可以接任意个参数
                if (equalValue != null) cv(equalValue, true)
              } else {
                ck(k, 'noNeedArgs') // 后面不能接参数
              }
            })
          }
        }
      } else {
        // 处理非 option
        cv(rawArg)
      }
    }

    if (_.length && this.stopParseOnFirstNoOption) stopped = true
  }

  var ct = this.consumeTarget
  if (ct && ct.needArgs > ct.currentArgs && ct.needArgs !== Infinity) {
    throw new Error('Error: ' + ct.type + ' option ' + this.formatOptionKey(ct.consumedKey) + ' need argument.')
  }
}

/**
 * 解析传入的参数
 *
 * - 解析到 "--" 就停止解析
 * - array 类型的参数支持重复设置，其它类型的参数会被覆盖，array 形式的 option 如果不加参数会返回空数组
 * - 支持短标签加数字的快捷方式，如 "-n100"，前提是 "-n" 需要是 number 类型
 * - 其它：https://github.com/yargs/yargs#parsing-tricks
 *
 * @param  {Array<String>} [args]  参数
 * @param {Function}      handle  parse 完成后，如果没有被内部 handle，则会调用此 handle
 * @return {Cli}
 *
 * @example
 *
 * cli.parse(process.argv.slice(2), function (res) {
 *   if (res.foo) {
 *     // do something
 *   }
 * })
 *
 */
Cli.prototype.parse = function(args, handle) {
  if (!Array.isArray(args)) {
    handle = args
    args = process.argv.slice(2)
  }

  parseInit.call(this)

  try {
    parse.call(this, args)
  } catch (e) {
    /* istanbul ignore else */
    if (/^Error: /.test(e.message)) {
      this.error(e.message)
      return this
    } else {
      throw e
    }
  }

  var res = this.res = {
    userDefined: {} // 记录所有的使用了用户定义的字段
  }
  var opts = this.mapOptions
  Object.keys(opts).forEach(function(k) {
    if ('value' in opts[k]) {
      res.userDefined[k] = true
    }
    var value = 'value' in opts[k] ? opts[k].value : opts[k].defaultValue
    if (value !== undefined) {
      res[k] = value
    }
  })

  res.rawArgs = args

  var _ = this._

  if (res.help) {
    this.help()
  } else if (res.version) {
    console.log(this.version ? strOrFunToString(this.version) : '0.0.0')
  } else {
    var commandKey = _[0]
    var commanderMap = this.mapCommands
    var commander = commandKey && commanderMap[commandKey]
    if (commandKey && !commander) {
      var newKey = Object.keys(commanderMap).find(function(k) {
        if (k.includes('*')) {
          return new RegExp('^' + k.replace(/\*/g, '.*') + '$').test(commandKey)
        }
        return false
      })
      commander = newKey && commanderMap[newKey]
    }

    if (commander) {
      res.$command = _[0]
      res._ = _.slice(1)
      commander.cmd.call(this, res, this)
    } else if (typeof handle === 'function') {
      res._ = _
      handle.call(this, res, this)
    }
  }
  return this
}

/**
 * 格式化 option 选项
 * @param  {String} key 选项名
 * @return {String}     带 "-" 或 "--" 的选项名
 */
Cli.prototype.formatOptionKey = function(key) {
  return key.length === 1 ? '-' + key : '--' + key
}

/**
 * 得到某个 option 的配置
 * @param  {String} key 选项名
 * @return {Object}     解析过后的配置
 */
Cli.prototype.getOptionConfig = function(key) {
  return this.mapOptions[key]
}

/**
 * 判断某个 option 是否存在
 * @param  {String}  key 选项名
 * @return {Boolean}
 */
Cli.prototype.isOptionKeyValid = function(key) {
  return key in this.mapOptions
}

/**
 * 输出错误信息
 *
 * @param {...*} arg 参数格式和 {@link module:libs/sys/clog.format} 的格式是一致的
 * @return {Cli}
 */
Cli.prototype.error = function() {
  console.log(format('\n%c%s\n', 'red', format.apply(null, arguments)))
  if (this.showHelpOnError) this.help()
  return this
}

/**
 * 根据 Cli 的配置，输出帮助信息
 */
Cli.prototype.help = function(returnStr) {
  var buffer = []
  var EOL = require('os').EOL
  var puts = function() { buffer.push(format.apply(null, arguments)) }
  var putsHeader = function(header) { puts('%c%s:\n', 'white.bold', header) }
  var putsCommands = function(header, obj) {
    var cache = []
    var rows = []
    Object.keys(obj).forEach(function(key) {
      var entry = obj[key]
      if (cache.indexOf(entry) >= 0) return
      cache.push(entry)
      var row = []
      row.push(format('  %c%s    ', 'green', entry.alias.join(', ')))
      row.push(format('%c%s', 'default', entry.desc))
      rows.push(row)
    })
    if (!rows.length) return
    putsHeader(header)
    puts(table(rows))
    puts()
  }

  puts()
  if (this.usage) {
    puts('%cUsage:  %c%s\n', 'white.bold', 'green', strOrFunToString(this.usage))
  }
  if (this.desc) {
    this.desc.forEach(function(row) { puts('  %c%s', 'gray', strOrFunToString(row)) })
    puts()
  }
  if (this.example) {
    putsHeader('Example')
    this.example.forEach(function(row) { puts('  %c%s', 'red.bg.white', strOrFunToString(row)) })
    puts()
  }

  putsCommands('Commands', this.mapCommands)

  if (this.groups.length) {
    var rows = []
    this.groups.forEach(function(group) {
      if (group !== DEFAULT_GROUP_NAME) {
        rows.push(['', '', ''])
        rows.push([format('  %c%s:', 'green.bold', group), '', ''])
        rows.push(['', '', ''])
      }
      this.groupsMap[group].forEach(function(entry) {
        var row = []
        var defaultValue = entry.defaultValue !== undef
          ? format('  %c[ default: %s ]', 'gray', JSON.stringify(entry.defaultValue))
          : ''
        row.push(format('  %c%s', 'green', entry.alias.map(function(a) { return (a.length === 1 ? '-' : '--') + a }).join(', ')))
        row.push(format('  %c%s  ', 'cyan', '<' + typeConfig[entry.type].label + '>'))
        row.push(format('%c%s', 'default', entry.desc + defaultValue))
        rows.push(row)
      })
    }, this)
    /* istanbul ignore else */
    if (rows.length) {
      putsHeader('Options')
      puts(table(rows))
      puts()
    }
  }

  if (this.epilog) puts('  %s\n', strOrFunToString(this.epilog))

  buffer = buffer.join(EOL)
  return returnStr ? buffer : /* istanbul ignore next */ console.log(buffer)
}

function checkOpt(opts, rawArg) {
  var optsArr = [].concat(opts)
  if (optsArr.every(this.isOptionKeyValid.bind(this))) {
    return true
  } else {
    invalidOpt.call(this, rawArg)
  }
}

function invalidOpt(rawArg) {
  if (this.strict) {
    throw new Error('Error: invalid option ' + rawArg + '.')
  } else {
    consumeVal.call(this, rawArg)
  }
}

function consumeKey(key, noNeedArgs, equalValue) {
  var conf = this.getOptionConfig(key)
  if (!conf) return invalidOpt.call(this, this.formatOptionKey(key))

  assign(conf, typeConfig[conf.type])
  conf.currentArgs = 0

  if (noNeedArgs && conf.needArgs > 0) {
    throw new Error('Error: ' + conf.type + ' option '
      + this.formatOptionKey(key) + ' need argument.')
  }

  switch (conf.type) {
    case 'bool':
      conf.value = true
      break
    case 'count':
      if (equalValue != null) throw new Error('Error: "' + key + '" option do not need argument.')
      if ('value' in conf) conf.value++
      else conf.value = 1
      break
    case 'arr':
      if (!conf.value) conf.value = []
      break
  }

  this.consumeTarget = conf
  conf.consumedKey = key
}

function consumeVal(val, isEqualValue) {
  var conf = this.consumeTarget
  var needArgs = conf ? conf.needArgs : 0
  if (isEqualValue && conf.needArgsWhenUseEqual) needArgs = conf.needArgsWhenUseEqual

  if (!conf || needArgs === conf.currentArgs) {
    this._.push(val)
  } else if (needArgs > conf.currentArgs) {
    var consumedKey = this.formatOptionKey(conf.consumedKey)
    conf.currentArgs++

    switch (conf.type) {
      case 'arr':
        conf.value.push(val)
        break
      case 'str':
        conf.value = val
        break
      case 'bool':
        conf.value = val === 'yes' || val === 'true'
        break
      case 'num':
        conf.value = parseNumber(val)
        if (isNaN(conf.value)) {
          throw new Error('Error: invalid number value "'
            + val + '" for option "'
            + consumedKey + '".')
        }
        break
    }
  } else {
    throw new SyntaxError('Parse error.')
  }
}

function parseNumber(val, ctx) {
  if (/\./.test(val)) val = parseFloat(val)
  else val = parseInt(val, 10)
  return val
}

function strOrFunToString(val) {
  return typeof val === 'function' ? val() : val
}

module.exports = Cli
