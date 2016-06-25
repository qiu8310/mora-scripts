var os = require('os')
var clog = require('./color')
var table = require('./table')
var assign = require('./assign')
var re = /^\s*<(bool|str|num|arr|count)[a-z]*>\s*(.*)$/
var specialKeys = ['help', 'version', 'usage', 'description', 'example', 'epilog']

var typeConfig = {
  bool: {
    needArgs: 0,
    currentArgs: 0
  },
  str: {
    needArgs: 1,
    currentArgs: 0
  },
  num: {
    needArgs: 1,
    currentArgs: 0
  },
  arr: {
    needArgs: Infinity,
    currentArgs: 0
  },
  count: {
    needArgs: 0,
    currentArgs: 0
  }
}

/*
  一个简单的 cli 参数处理程序

  opts 是 key-value 对象，支持下面几种类型的配置
    - str1:str2... => <type> desc
      str1 是一个 option，":" 后面的 str2 等等表示 str1 的别名；
      desc 表示 option 的描述；
      type 表示 option 的类型，支持的类型有
        * boolean   bool
        * string    str   不能为空
        * number    num   不能为空
        * array     arr   可以为空
        * count

    - 支持几个特殊的 key
      * help        后面接的字符都是 help option 的描述字段
      * version     后面需要接当前命令行的版本号，默认值是 "0.0.0"
      * usage       使用说明（默认不存在）
      * description 描述，应该是个数组（默认不存在）
      * example     使用样例，可以是字符串数组，表示多个 example（默认不存在）
      * epilog      放在 help 结尾的一段话，一般用来声明版权，或者显示查看更多的链接（默认不存在）

      所有命令行都会默认带上 help 和 version，如果你不想要它们，
      可以在 opts 中将它们的值设置成 false

    - 支持子命令，即将 key 对应的 value 设置成字符串即可，
      另外 key 也支持 str1:str2... 这样的别名形式

  配置项：
    - hideHelpOnError:    解析参数失败时不显示帮助信息
    - ignoreInvalidOpt:   遇到无法解析的 option 不要报错（即会把它当作 _ 中的值）

  其它：https://github.com/yargs/yargs#parsing-tricks
    - 解析到 "--" 就停止解析
    - array 类型的参数支持重复设置，其它类型的参数会被覆盖
    - 支持短标签加数字的快捷方式，如 "-n100"，前提是 "-n" 需要是 number 类型


  有 help 的话默认会加上 h 的别名
  有 version 的话默认会加上 v 的别名
  help 和 version 在 help option 的最后显示
  默认显示短名称在最前面（直接使用数组的字符串排序）
 */

function Cli(opts, args, main) {
  if (!(this instanceof Cli)) return new Cli(opts, args, main)

  if (typeof args === 'function') {
    main = args
    args = process.argv.slice(2)
  }

  this.hideHelpOnError = Cli.hideHelpOnError
  this.ignoreInvalidOpt = Cli.ignoreInvalidOpt
  this._ = []

  // version epilog usage example description
  // options commands aliasMap
  init.call(this, assign({}, opts))

  try {
    parse.call(this, args)
  } catch (e) {
    if (/^Error: /.test(e.message)) {
      this.error(e.message)
      return this
    } else {
      throw e
    }
  }

  var res = {}, opts = this.options
  Object.keys(opts).forEach(function (k) {
    opts[k].alias.forEach(function (alias) {
      res[alias] = opts[k].value
    })
  })

  res.rawArgs = args

  var _ = this._
  var command = _[0] && this.commands[_[0]]

  if (res.help) {
    this.help()
  } else if (res.version) {
    console.log(this.version)
  } else if (command) {
    res._ = _.slice(1)
    command.call(this, res)
  } else if (main) {
    res._ = _
    main.call(this, res)
  }
}


var p = Cli.prototype;


// 格式化 option 的 key
p.formatOptKey = function (key) {
  return key.length === 1 ? '-' + key : '--' + key
}

p.getOptConfig = function (key) {
  key = this.aliasMap[key]
  if (key) return this.options[key]
}

// 输出错误
p.error = function (msg) {
  clog('\n%c%s\n', 'red', msg)
  if (!this.hideHelpOnError) this.help()
}

// 输出 help
p.help = function () {
  if (this.usage) {
    clog('\n%cUsage:  %c%s\n', 'white.bold', 'green', this.usage)
  }
  if (this.description) {
    this.description.forEach(function (row) { clog('  %c%s', 'gray', row) })
    clog()
  }
  if (this.example) {
    clog('%cExample%s:\n', 'white.bold', this.example.length ? 's' : '')
    this.example.forEach(function (row) { clog('  %c%s%c', 'red.bg.white', row, 'end') })
    clog()
  }

  // options
  var opts = this.options, rows = []
  Object.keys(opts).forEach(function (k) {
    var row = []
    row.push(clog.format('  %c%s', 'green',   opts[k].alias.join(', ')))
    row.push(clog.format('  %c%s  ', 'cyan',    '<' + opts[k].type + '>'))
    row.push(clog.format('%c%s', 'default', opts[k].desc))
    rows.push(row)
  })
  if (rows.length) {
    clog('%cOptions:\n', 'white.bold')
    console.log(table(rows))
    clog()
  }

  if (this.epilog) clog('  %s\n', this.epilog)
}


function init(opts) {
  var options = {}, commands = {}, aliasMap = {}

  if (opts.help !== false)
    opts['help:h'] = '<bool> ' + (typeof opts.help === 'string' ? opts.help : 'show help')
  if (opts.version !== false) {
    this.version = opts.version
    opts['version:v'] = '<bool> ' + 'show version'
  }
  if (opts.usage) this.usage = opts.usage
  if (opts.description) this.description = [].concat(opts.description)
  if (opts.example) this.example = [].concat(opts.example)
  if (opts.epilog) this.epilog = opts.epilog

  specialKeys.forEach(function (k) { delete opts[k] })

  Object.keys(opts).forEach(function (k) {
    var key, type, value, desc, alias, conf

    alias = k.split(':').sort()
    key = alias[0]
    value = opts[k]

    if (re.test(value)) {
      type = RegExp.$1
      desc = RegExp.$2

      conf = {key: key, alias: alias, type: type, desc: desc, raw: value}
      alias.forEach(function (k) {
        if (k in aliasMap) throw new Error('Option key "' + k + '" is dumplicated.')
        aliasMap[k] = key
      })
      options[key] = conf
    } else if (typeof value === 'function') {
      alias.forEach(function (k) { commands[k] = value })
    } else {
      throw new Error('Option ' + k + ' value "' + value + '" is invalid.')
    }
  })

  this.options = options
  this.commands = commands
  this.aliasMap = aliasMap
}


function parse(args) {
  var _ = this._
  var opts = this.options
  var i, arg, stopped
  var ck = consumeKey.bind(this)
  var cv = consumeVal.bind(this)

  for (i = 0; i < args.length; i++) {
    arg = args[i]
    if (stopped) {
      _.push(arg)
    } else if (arg === '--') {
      stopped = true
    } else if (arg.slice(0, 2) === '--') { // 长参数
      ck(arg.slice(2))
    } else if (arg[0] === '-' && arg.length === 2) { // 单个短参数
      ck(arg[1])
    } else if (arg[0] === '-') { // 多个短参数，或单个数字短参数
      arg = arg.slice(1)

      if (/^\w(\d+)$/.test(arg)) {
        ck(arg[0])
        cv(arg.slice(1))
      } else {
        arg.split('').forEach(function (k, i, ref) {
          if (ref.length - 1 === i) {
            ck(k)    // 最好一个 option 可以接任意个参数
          } else {
            ck(k, 'noNeedArgs') // 后面不能接参数
          }
        }.bind(this))
      }
    } else {
      // 处理非 option
      cv(arg)
    }
  }

  var conf = this.conf
  if (conf && conf.needArgs > conf.currentArgs && conf.needArgs !== Infinity) {
    throw new Error('Error: ' + conf.type + ' option ' + this.formatOptKey(conf.consumedKey) + ' need argument')
  }
}

function invalidOpt(arg) {
  arg = this.formatOptKey(arg)

  if (this.ignoreInvalidOpt) {
    consumeVal.call(this, arg) // TODO 如果之前是通过 -cccc 这种组合短参数时，如果 c 不存在，则不好恢复原有的格式！
  } else {
    throw new Error('Error: invalid option ' + arg)
  }
}

function consumeKey(key, noNeedArgs) {
  var conf = this.getOptConfig(key)
  if (!conf) return invalidOpt.call(this, key)

  if (noNeedArgs && conf.needArgs > 0)
    throw new Error('Error: ' + conf.type + ' option '
      + this.formatOptKey(key) + ' need argument')

  switch (conf.type) {
    case 'bool':
      conf.value = true;
      break;
    case 'count':
      if ('value' in conf) conf.value++
      else conf.value = 1
      break;
    case 'arr':
      conf.value = []
      break;
  }

  assign(conf, typeConfig[conf.type])

  this.conf = conf
  conf.consumedKey = key
}

function consumeVal(val) {
  var conf = this.conf
  if (!conf || conf.needArgs === conf.currentArgs) {
    this._.push(val)
  } else if (conf.needArgs > conf.currentArgs) {

    var consumedKey = this.formatOptKey(conf.consumedKey)

    switch (conf.type) {
      case 'arr':
        conf.value.push(val)
        conf.currentArgs++
        break;
      case 'str':
        conf.value = val
        conf.currentArgs++
        break;
      case 'num':
        conf.value = parseNumber(val)
        conf.currentArgs++
        if (isNaN(conf.value)) {
          throw new Error('Error: invalid number value "'
            + val + '" for option "'
            + consumedKey + '"')
        }
        break;
      default:
        throw new Error('Error: ' + conf.type + ' option '
          + consumedKey + ' do not need argument')
    }
  } else {
    throw new SyntaxError('Parse error.')
  }
}


function parseNumber(val, ctx) {
  if (/\./.test(val)) val = parseFloat(val)
  else val = parseInt(val, 10)
  return val;
}

module.exports = Cli



