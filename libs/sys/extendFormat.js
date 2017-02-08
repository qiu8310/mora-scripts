/**
 * @module      libs/sys/extendFormat
 * @createdAt   2016-07-14
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var util = require('util')
var isPlainObject = require('../lang/isPlainObject')

// 之前还不想考虑 %% 的情况，因为它不需要处理
// 后来发现，如果不处理 %%，那么处理 %%c 情况
// 时就会出错，所以还必须在正则里处理 %% 转义
var baseMatchers = [
  {match: /%%/, order: 0, expectArgNum: 0, handle: function() { return '%%' }},
  {match: /%s/},
  {match: /%d/},
  {match: /%j/}
]
var reIllegalMatch = /(^|[^\\])\((?!\?[:=!])/

/**
 * 扩展系统的 util.format 函数，使其支持其它格式
 *
 * 默认的 util.format 只支持 %s %d %j %% 四个参数
 *
 * @param  {RegExp|Object|Array<Object>}  regexp  可以是下面三种形式：
 *   - RegExp: 一个不包含捕获数组（正则中没有括号 或者是 "(?: ... )" 这种形式）的正则表达式（正则如果有 modifiers，会忽略掉）
 *   - Object: Object 需要包含 match: RegExp 和 handle: Function，另外还可以配置 order: 优先级，expectArgNum: 处理的参数的个数
 *   - Array: 表示有多个上面的 Object
 *
 * @param  {Function}                     [fn]    当第一个参数是 RegExp 时，此参数才有意义，表示 handle 函数
 * @return {Function}                             新的 format 函数
 *
 * @example
 * // 1. 匹配 "%" + 数字 + "c" 形式的结构
 * var format = extendFormat(/%\dc/, function (values, format) {
 *   return values[0].repeat(parseInt(values[0], 10)) + ' c'
 * })
 *
 * format('foo %2c', 'bar') // => 'foo barbar c'
 *
 * @example
 * // 2. 如果要继承多个，不要一个一个去调用，使用数组来批量注入
 * var format = extendFormat([
 *   {
 *     match: /%\dd/,
 *     expectArgNum: 2,      // 期望的参数个数（默认为1），如果参数不足，则 handle 不会被调用
 *     order: 100,           // 用来决定调用 format 的顺序，默认为100，越小优先级越高
 *
 *     handle(val1, val2, format) {},
 *
 *     // 下面六个 hook 需要返回字符串，或 undefined
 *     onStart(parsedTemplateArray) {},   // 返回的字段会出现在输出的最前面
 *     onEnd(parsedTemplateArray) {},     // 返回的字段会出现在输出的最后面
 *
 *     onGroupStart(parsedTemplate, template) {},           // 在单个模板替换前调用
 *     onGroupEnd(parsedTemplate, replacedTemplate) {},     // 在单个模板替换后调用
 *
 *     onFormatStart(templateArg, parsedTemplate) {},  // 在模板的每个字段替换前调用
 *     onFormatEnd(templateArg, parsedTemplate) {}     // 在模板的每个字段替换后调用
 *   },
 *
 *   {
 *     match: /%\ds/,
 *     handle: ...
 *   }
 * ])
 *
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
module.exports = function(regexp, fn) {
  var matchers = regexp

  if (isPlainObject(regexp)) {
    matchers = [regexp]
  } else if (!Array.isArray(regexp)) {
    matchers = [{ match: regexp, handle: fn }]
  }

  matchers = baseMatchers
    .concat(matchers)
    .map(matcherMap)
    .sort(matcherSort)

  regexp = buildRegExp(matchers.map(function(it) { return it.match }))

  return function format() {
    var i, group, arg, argIndex
    var groups = []

    for (i = 0; i < arguments.length; i++) {
      if (!group || group.argNum === group.expectArgNum) {
        if (group) {
          groups.push(group)
        }
        argIndex = 0
        group = parseToGroup(matchers, regexp, arguments[i])
      } else {
        group.argNum++
        arg = group.args[argIndex]
        while (arg.matcher.expectArgNum === arg.values.length) {
          arg = group.args[++argIndex]
        }
        arg.values.push(arguments[i])
      }
    }

    if (group && groups.indexOf(group) < 0) groups.push(group)

    return hook(matchers, 'onStart', -1, [groups])
          + util.format.apply(util, groups.reduce(function(newArgs, group, i) {
            newArgs.push.apply(newArgs, compileToNewArgs(matchers, regexp, group))
            return newArgs
          }, []))
          + hook(matchers, 'onEnd', 1, [groups]) + '' // make it to string
  }
}

function parseToGroup(matchers, regexp, template) {
  var group = { template: template, args: [], expectArgNum: 0, argNum: 0 }

  if (typeof template === 'string') {
    template.replace(regexp, function(format) {
      var i, matcher
      for (i = 0; i < matchers.length; i++) {
        if (format === arguments[i + 1]) {
          matcher = matchers[i]
          break
        }
      }

      group.args.push({
        matcher: matchers[i],
        format: format,
        values: []
      })

      group.expectArgNum += matcher.expectArgNum
    })
  }

  return group
}

function compileToNewArgs(matchers, regexp, group) {
  var result = []
  var template = group.template
  var args = group.args
  var prefix, suffix
  if (typeof template === 'string') {
    prefix = hook(matchers, 'onGroupStart', -1, [group, template])
    template = template.replace(regexp, function(raw) {
      // 既然进来了，就一定有 args.length > 0
      if (args[0].matcher.expectArgNum > group.argNum) { // 参数不足，给原生处理
        // 参数不足时一定是 args.length === 1
        result.push.apply(result, args[0].values)
        return raw
      } else {
        var arg = args.shift()
        var matcher = arg.matcher
        var format = arg.format
        var values = arg.values
        group.argNum -= values.length

        if (matcher.handle) {
          // 注意： 用户 handle 返回的数据不一定都是字符串，但这里的 template 一定是字符串
          //       所以强制转化成字符串
          raw = String(matcher.handle.apply(matcher, values.concat(format)))
        } else {
          // 没有 handle 则表示是原生支持的，给原生处理
          result.push.apply(result, values)
        }

        return hook(matchers, 'onFormatStart', -1, [arg, group])
               + raw
               + hook(matchers, 'onFormatEnd', 1, [arg, group])
      }
    })

    suffix = hook(matchers, 'onGroupEnd', 1, [group, template])
    template = prefix + template + suffix
  }

  result.unshift(template)
  return result
}

function hook(matchers, fn, order, args) {
  var l = matchers.length
  var i = l
  var result = []

  if (order > 0) {
    while (i--) {
      _add(result, _callFn(matchers[i][fn], matchers[i], args))
    }
  } else {
    for (i = 0; i < l; i++) {
      _add(result, _callFn(matchers[i][fn], matchers[i], args))
    }
  }
  return result.join('')
}

function _add(arr, item) {
  if (item !== undefined) arr.push(String(item))
}

function _callFn(fn, binder, args) {
  if (typeof fn === 'function') return fn.apply(binder, args)
}

// 根据需要 extend 的参数重新生成 正则
function buildRegExp(regexps) {
  return new RegExp(regexps.map(stringifyRegExp).join('|'), 'g')
}

// 将用户提供的正则转化成字符串，并去掉首尾以提供给新的正则使用
function stringifyRegExp(regexp) {
  return '(' + regexp.toString().replace(/^\/|\/\w*$/g, '') + ')'
}

function matcherSort(a, b) {
  return a.order - b.order
}

function matcherMap(matcher) {
  if (reIllegalMatch.test(matcher.match)) throw new Error('正则不能使用捕获性数组')
  if (!('order' in matcher)) matcher.order = 100
  if (!('expectArgNum' in matcher)) matcher.expectArgNum = 1
  return matcher
}

