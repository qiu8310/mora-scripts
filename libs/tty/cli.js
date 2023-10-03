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
var reOptionType = /^(bool|str|num|arr|count|bstr|bnum)[a-z]*$/
var reOption = /^\s*(!?)<(bool|str|num|arr|count|bstr|bnum)[a-z]*>\s*([\s\S]*?)(?:\{\{(.*)\}\})?$/
var undef = void 0
var DEFAULT_GROUP_NAME = '__default__:)'

var typeConfig = {
  bool: {
    label: 'boolean',
    needArgs: 0,
    boolean: true // 表示也可以不接参数，或者后面接 true/false 参数
  },
  str: {
    label: 'string',
    needArgs: 1
  },
  bstr: {
    label: 'boolean/string',
    needArgs: 1,
    boolean: true
  },
  num: {
    label: 'number',
    needArgs: 1
  },
  bnum: {
    label: 'boolean/number',
    needArgs: 1,
    boolean: true
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
 * @param {(() => void} conf.bootstrap                            初始化操作，在命令后面添加 ---bootstrap 才会触发此函数执行
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
  this.mapOptions = {}
  this.mapEnv = {}

  /**
   * 所有的命令分组名称
   * @type {Array}
   */
  this.commandGroups = []
  this.commandGroupsMap = {}

  this.optionsGroups = []
  this.optionsGroupsMap = {}

  this.envGroups = []
  this.envGroupsMap = {}

  if (conf.usage) this.usage = conf.usage
  if (conf.desc) this.desc = [].concat(conf.desc)
  if (conf.example) this.example = [].concat(conf.example)
  if (conf.epilog) this.epilog = conf.epilog
  if (conf.bootstrap) this.bootstrap = conf.bootstrap
}

/**
 * 设置 Cli 程序的子命令
 *
 * @param  {Object} opts 子命令配置
 *
 *   opts 是 key-value 对象，支持下面几种类型的配置
 *   - str1:str2... => function
 *   - str1:str2... => {group: '', desc: '', cmd: function}
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
 *     group: 'category',
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
 *     * boolean/number   bnum
 *     * boolean/number   bstr
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
Cli.prototype.options = function(group, opts, isEnv) {
  if (typeof group !== 'string') {
    opts = group
    group = null
  }
  if (!opts) return
  init.call(this, false, opts, group, isEnv)
  return this
}

Cli.prototype.env = function(group, opts) {
  return this.options(group, opts, true)
}

function init(isCommand, opts, customGroup, isEnv) {
  Object.keys(opts).forEach(function(origKey) {
    var key, type, value, cmd, desc, alias, defaultValue, target, hideInHelp
    var group = customGroup || DEFAULT_GROUP_NAME

    alias = origKey.trim().split(/\s*\|\s*/)
    key = alias[0]
    value = opts[origKey]

    var groups = isCommand ? this.commandGroups : isEnv ? this.envGroups : this.optionsGroups
    var groupsMap = isCommand ? this.commandGroupsMap : isEnv ? this.envGroupsMap : this.optionsGroupsMap
    var map = isCommand ? this.mapCommands : isEnv ? this.mapEnv : this.mapOptions

    if (isCommand) {
      if (typeof value === 'function') {
        cmd = value
        desc = ''
      } else if (isPlainObject(value)) {
        if (value.group) group = value.group
        hideInHelp = value.hideInHelp
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

      target = { key: key, alias: alias, cmd: cmd, type: 'command', group: group, desc: desc, hideInHelp: hideInHelp }
    } else {
      if (typeof value === 'string') {
        if (reOption.test(value)) {
          hideInHelp = RegExp.$1 === '!'
          type = RegExp.$2
          desc = RegExp.$3
          if (RegExp.$4) {
            defaultValue = RegExp.$4
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
        hideInHelp = value.hideInHelp
        defaultValue = value.defaultValue
        if (value.group) group = value.group

        if (reOptionType.test(type)) {
          type = RegExp.$1
        } else {
          throw new Error('Option "' + origKey + '" type is invalid.')
        }
      } else {
        throw new Error('Option "' + origKey + '" is invalid.')
      }
      target = { key: key, alias: alias, defaultValue: defaultValue, type: type, group: group, desc: desc, hideInHelp: hideInHelp }
    }
    if (groups.indexOf(group) < 0) {
      if (group === DEFAULT_GROUP_NAME) {
        groups.unshift(group)
      } else {
        groups.push(group)
      }
      groupsMap[group] = []
    }
    groupsMap[group].push(target)

    alias.forEach(function(k) {
      if (k in map) throw new Error((isCommand ? 'Command' : isEnv ? 'Env' : 'Option') + ' key "' + k + '" is duplicated.')
      map[k] = target
    })
  }, this)
}

// 确保将 -h, -v 放在 default group 的最后面
function parseInit() {
  var conf = this.conf
  var opts = {}
  if (conf.help !== false) {
    opts['help | h'] = '<bool> ' + (typeof conf.help === 'string' ? conf.help : 'Show help')
  }
  if (conf.version !== false) {
    this.version = conf.version
    opts['version | v'] = '<bool> ' + 'Show version'
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
    } else if (_.length === 0 && this.getCommanderByKey(arg)) { // 运行子命令剩下的参数给子命令去解析
      stopped = true
      _.push(arg)
    } else if (arg === '--') {
      stopped = true
    } else {
      var equalValue = null
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

  // 对最后一个 consumeTarget 判断其参数是否符合
  var ct = this.consumeTarget
  if (ct && !ct.boolean && ct.needArgs > ct.currentArgs && ct.needArgs !== Infinity) {
    throw new Error('Error: ' + ct.type + ' option ' + this.formatOptionKey(ct.consumedKey) + ' need argument.')
  }
}

function parseEnv(mapEnv) {
  Object.keys(mapEnv).forEach(function(key) {
    // { key: key, alias: alias, defaultValue: defaultValue, type: type, group: group, desc: desc }
    var target = mapEnv[key]
    if (process.env.hasOwnProperty(key)) {
      var value = process.env[target.key]
      switch (target.type) {
        case 'str':
          target.value = value
          break
        case 'bool':
          target.value = !(!value || value === 'false' || value === 'no' || value === '0')
          break
        case 'num':
          target.value = parseFloat(value)
          break
        case 'bnum':
          if (value === 'false') target.value = false
          else if (value === 'true') target.value = true
          else target.value = parseFloat(value)
          break
        case 'bstr':
          if (value === 'false') target.value = false
          else if (value === 'true') target.value = true
          else target.value = value
          break
        default:
          throw new Error('Not supported env type "' + target.type + '"')
      }
    }
  })
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

  var tripe = ''
  if (args[0] && args[0].startsWith('---') && !args[0].startsWith('----')) {
    tripe = args.shift().slice(3)
  }

  parseInit.call(this)

  try {
    parse.call(this, args)
  } catch (e) {
    // completion 模式不会运行命令，所以参数解析失败关系不大
    if (tripe !== 'completion') {
      /* istanbul ignore else */
      if (/^Error: /.test(e.message)) {
        this.error(e.message)
        return this
      } else {
        throw e
      }
    }
  }

  parseEnv(this.mapEnv)

  var res = this.res = {
    userDefinedOptions: {}, // 记录所有的使用了用户定义的字段
    userDefinedEnv: {},
    env: {}
  }
  res.userDefined = res.userDefinedOptions // 兼容老版本

  var run = function(opts, defined, assignTarget) {
    Object.keys(opts).forEach(function(k) {
      if ('value' in opts[k]) {
        defined[k] = true
      }
      var value = 'value' in opts[k] ? opts[k].value : opts[k].defaultValue
      if (value !== undefined) {
        assignTarget[k] = value
      }
    })
  }

  run(this.mapOptions, res.userDefinedOptions, res)
  run(this.mapEnv, res.userDefinedEnv, res.env)

  res.rawArgs = args

  var _ = this._

  if (res.help && this.conf.help !== false) {
    this.help()
  } else if (res.version && this.conf.version !== false) {
    console.log(this.version ? strOrFunToString(this.version) : '0.0.0')
  } else {
    var commander = this.getCommanderByKey(_[0])
    var tripeFunc = tripe && this.conf[tripe]

    // 如果有子命令，需要在子命令中获取补全
    // 没有子命令，或者当前要补全的参数刚好只有一个时
    if (tripe === 'completion' && (!commander || _.length === 1)) {
      var cmdKeys = Object.keys(this.mapCommands)
      var optKeys = Object.keys(this.mapOptions).map(function(k) { return k.length > 1 ? '--' + k : '-' + k })
      var allKeys = cmdKeys.concat(optKeys)
      var compKeys

      var compArg = args[args.length - 1] // 最后一个要补全的参数
      var prevArg = args[args.length - 2]

      if (!(compArg && compArg.startsWith('-')) && prevArg && prevArg.startsWith('-')) {
        var prevKey = prevArg.replace(/^-{1,2}/, '')
        var target = this.mapOptions[prevKey]
        if (target && target.needArgs > 0) {
          compKeys = [] // 后面是补全参数的值，不需要自动补全
        }
      }

      if (!compKeys) {
        compKeys = !compArg ? cmdKeys : allKeys.filter(function(k) { return k.startsWith(compArg) })
      }

      if (typeof tripeFunc === 'function') {
        compKeys = tripeFunc(compKeys, res)
      }

      if (Array.isArray(compKeys)) {
        console.log(compKeys.join('\n'))
      }

      return
    }

    if (commander) {
      res.$command = _[0]
      res._ = _.slice(1)
      if (tripe) res._.unshift('---' + tripe)
      commander.cmd.call(this, res, this)
    } else if (typeof tripeFunc === 'function') {
      tripeFunc.call(res)
    } else if (typeof handle === 'function') {
      res._ = _
      handle.call(this, res, this)
    }
  }
  return this
}

Cli.prototype.getCommanderByKey = function(key) {
  var commanderMap = this.mapCommands
  var commander = key && commanderMap[key]
  if (key && !commander) {
    var newKey = Object.keys(commanderMap).find(function(k) {
      if (k.includes('*')) {
        return new RegExp('^' + k.replace(/\*/g, '.*') + '$').test(key)
      }
      return false
    })
    commander = newKey && commanderMap[newKey]
  }
  return commander
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

  var putsGroups = function(title, groups, groupsMap) {
    if (groups.length) {
      var rows = []
      groups.forEach(function(group) {
        if (group !== DEFAULT_GROUP_NAME && groupsMap[group].some(function(e) { return !e.hideInHelp })) {
          rows.push(['', '', ''])
          rows.push([format('  %c%s:', 'green.bold', group), '', ''])
          rows.push(['', '', ''])
        }
        groupsMap[group].forEach(function(entry) {
          if (entry.hideInHelp) return
          var row = []

          if (title === 'Commands') {
            row.push(format('  %c%s    ', 'green', entry.alias.join(', ')))
            row.push(format('%c%s', 'default', entry.desc))
            row.push('')
          } else {
            var defaultValue = entry.defaultValue !== undef
              ? format('  %c[ default: %s ]', 'gray', JSON.stringify(entry.defaultValue))
              : ''
            var alias = title === 'Env' ? entry.alias : entry.alias.map(function(a) { return (a.length === 1 ? '-' : '--') + a })
            row.push(format('  %c%s', 'green', alias.join(', ')))
            row.push(format('  %c%s  ', 'cyan', '<' + typeConfig[entry.type].label + '>'))
            row.push(format('%c%s', 'default', entry.desc + defaultValue))
          }

          rows.push(row)
        })
      }, this)

      /* istanbul ignore else */
      if (rows.length) {
        putsHeader(title)
        puts(table(rows))
        puts()
      }
    }
  }

  putsGroups('Commands', this.commandGroups, this.commandGroupsMap)
  putsGroups('Options', this.optionsGroups, this.optionsGroupsMap)
  putsGroups('Env', this.envGroups, this.envGroupsMap)

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
    case 'bstr':
    case 'bnum':
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
  var lowerVal = val.toLowerCase()
  var conf = this.consumeTarget
  var needArgs = conf ? conf.needArgs : 0

  // boolean 相关的参数可以接受 boolean 值
  if (!needArgs && conf && conf.boolean && (isEqualValue || (lowerVal === 'true' || lowerVal === 'false'))) {
    needArgs = 1
  }

  /* istanbul ignore else */
  if (!conf || needArgs <= conf.currentArgs) {
    this._.push(val)
  } else if (needArgs > conf.currentArgs) {
    var consumedKey = this.formatOptionKey(conf.consumedKey)
    conf.currentArgs++
    switch (conf.type) {
      case 'arr':
        conf.value.push(val)
        break
      case 'str':
      case 'bstr':
        if (conf.type === 'bstr' && lowerVal === 'true') conf.value = true
        else if (conf.type === 'bstr' && lowerVal === 'false') conf.value = false
        else conf.value = val
        break
      case 'bool':
        // 单独的 boolean 值在 --key=val 的模式下支持 val 配置成 "yes"
        conf.value = lowerVal === 'true' || lowerVal === 'yes'
        break
      case 'num':
      case 'bnum':
        if (conf.type === 'bnum' && lowerVal === 'true') conf.value = true
        else if (conf.type === 'bnum' && lowerVal === 'false') conf.value = false
        else conf.value = parseNumber(val)

        if (isNaN(conf.value)) {
          throw new Error('Error: invalid number value "'
            + val + '" for option "'
            + consumedKey + '".')
        }
        break
    }
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
