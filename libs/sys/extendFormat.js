var util = require('util')
var isPlainObject = require('../lang/isPlainObject')

/*
  默认的 util.format 只支持 %s %d %j %% 四个参数
  如果想要它支持更多的参数，可以使用此函数

  NOTICE: regexp 中不能出现 "(...)"，可以出现 "(?:...)"，也不要出现 modifiers

  Return: 新的 format 函数

  Example:

    1. 匹配 "%" + 数字 + "c" 形式的结构
    extend(/%\dc/, function (val, format) {

    })

    2. 如果要继承多个，不要一个一个去调用，使用下面这个批量注入的方法

    extend([
      {
        match: /%\dd/,
        expectArgNum: 1,      // 期望的参数个数（默认为1）
        order: 100,           // 用来决定调用 format 的顺序，默认为100

        handle(val, format) {},

        // 下面六个 hook 需要返回字符串，或 undefined
        onStart(parsedTemplateArray) {},   // 返回的字段会出现在输出的最前面
        onEnd(parsedTemplateArray) {},     // 返回的字段会出现在输出的最后面

        onFormatStart(parsedTemplate, template) {},           // 在单个模板替换前调用
        onFormatEnd(parsedTemplate, replacedTemplate) {},     // 在单个模板替换后调用

        onEachFormatStart(templateArg, parsedTemplate) {},  // 在模板的每个字段替换前调用
        onEachFormatEnd(templateArg, parsedTemplate) {}     // 在模板的每个字段替换后调用
      },

      {
        match: /%\ds/,
        handle: ...
      }
    ])
 */


// 之前还不想考虑 %% 的情况，因为它不需要处理
// 后来发现，如果不处理 %%，那么处理 %%c 情况
// 时就会出错，所以还必须在正则里处理 %% 转义
var baseMatchers = [
  {match: /%%/, order: 0, expectArgNum: 0, handle: function () { return '%%' }},
  {match: /%s/},
  {match: /%d/},
  {match: /%j/}
]

function extend(regexp, fn) {
  var matchers = regexp

  if (isPlainObject(regexp)) {
    matchers = [regexp]
  } else if (!Array.isArray(regexp)) {
    matchers = [{ match: regexp, handle: fn }]
  }

  matchers = baseMatchers.concat(matchers).sort(matcherSort)

  regexp = buildRegExp(matchers.map(function (it) { return it.match }))

  return function format() {
    var i, parsed, group = [];
    for (i = 0; i < arguments.length; i++) {
      if (!parsed || parsed.argNum === parsed.expectArgNum) {
        if (parsed) {
          group.push(parsed);
        }
        parsed = parse(matchers, regexp, arguments[i]);
      } else {
        parsed.templateArgs[parsed.argNum++].value = arguments[i];
      }
    }
    if (parsed && group.indexOf(parsed) < 0) group.push(parsed);

    return hook(matchers, 'onStart', -1, [group])
          + util.format.apply(util, group.reduce(function (args, parsed, i) {
              args.push.apply(args, compile(matchers, regexp, parsed));
              return args;
            }, []))
          + hook(matchers, 'onEnd', 1, [group])
  }
}

function parse(matchers, regexp, template) {
  var parsed = {template: template, templateArgs: [], expectArgNum: 0, argNum: 0};
  if (typeof template === 'string') {
    template.replace(regexp, function (format) {
      var i, matcher
      for (i = 0; i < matchers.length; i++) {
        if (format === arguments[i + 1]) {
          matcher = matchers[i]
          break;
        }
      }

      parsed.templateArgs.push({
        matcher: matchers[i],
        format: format,
        value: null
      })

      parsed.expectArgNum += 'expectArgNum' in matcher ? matcher.expectArgNum : 1
    });
  }

  return parsed
}

function compile(matchers, regexp, parsed) {
  var result = []
  var template = parsed.template
  var templateArgs = parsed.templateArgs
  var prefix, suffix

  if (typeof template === 'string' && parsed.argNum) {
    prefix = hook(matchers, 'onFormatStart', -1, [parsed, template])

    template = template.replace(regexp, function (raw) {
      if (!parsed.argNum) {
        return raw  // 参数个数不足，给原生处理
      } else {
        parsed.argNum--

        var templateArg = templateArgs.shift()
          matcher = templateArg.matcher
          format = templateArg.format
          value = templateArg.value

        if (matcher.handle) {
          //注意： 用户 handle 返回的数据不一定都是字符串，但这里的 template 一定是字符串
          //      所以强制转化成字符串
          raw = String(matcher.handle(value, format))
        } else {
          result.push(value) // 没有 handle 则表示是原生支持的，给原生处理
        }

        return hook(matchers, 'onEachFormatStart', -1, [templateArg, parsed])
             + raw
             + hook(matchers, 'onEachFormatEnd',    1, [templateArg, parsed])
      }
    })

    suffix = hook(matchers, 'onFormatEnd', 1, [parsed, template])
    template = prefix + template + suffix
  }

  result.unshift(template);
  return result;
}

function hook(matchers, fn, order, args) {
  var l = matchers.length, i = l, result = []
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
  return ('order' in a ? a.order : 100 ) - ('order' in b ? b.order : 100)
}


module.exports = extend
