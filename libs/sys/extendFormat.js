var util = require('util')

/*
  默认的 util.format 只支持 %s %d %j %% 四个参数
  如果想要它支持更多的参数，可以使用此函数

  NOTICE: regexp 中不能出现括号，也不要出现 modifiers

  Return: 新的 format 函数

  Example:

    1. 匹配 "%" + 数字 + "c" 形式的结构
    extend(/%\dc/, function (arg) {

    })

    2. 如果要继承多个，不要一个一个去调用，使用下面这个批量注入的方法

    extend([
      {
        match: /%\dd/
        handle: ...
      },

      {
        match: /%\ds/
        handle: ...
      }
    ])
 */



// 之前还不想考虑 %% 的情况，因为它不需要处理
// 后来发现，如果不处理 %%，那么处理 %%c 情况
// 时就会出错，所以还必须在正则里处理 %% 转义
var baseMatchers = [
  {match: /%s/},
  {match: /%d/},
  {match: /%j/},
  {match: /%%/, handle: function () { return '%%' }}
]


function extend(regexp, fn) {
  var matchers = regexp
  if (!Array.isArray(regexp)) matchers = [{ match: regexp, handle: fn }]
  matchers = baseMatchers.concat(matchers)

  regexp = buildRegExp(matchers.map(function (it) { return it.match }))

  return function format() {
    var i, parsed, group = [];
    for (i = 0; i < arguments.length; i++) {
      if (!parsed || parsed.count === 0) {
        if (parsed) {
          group.push(parsed);
        }
        parsed = parse(regexp, arguments[i]);
      } else {
        parsed.args.push(arguments[i]);
        parsed.count--;
      }
    }
    if (parsed && group.indexOf(parsed) < 0) group.push(parsed);

    return util.format.apply(util, group.reduce(function (args, parsed, i) {
      args.push.apply(args, compile(matchers, regexp, parsed));
      return args;
    }, []));
  }
}

function parse(regexp, arg) {
  var parsed = {arg: arg, count: 0, args: []};
  if (typeof arg === 'string') {
    arg.replace(regexp, function (raw) {
      if (raw !== '%%') parsed.count++;
    });
  }
  return parsed;
}

function compile(matchers, regexp, parsed) {
  var args = [];
  var arg = parsed.arg;
  if (typeof arg === 'string') {
    arg = arg.replace(regexp, function (raw) {
      var index, matcher, value
      for (var index = 0; index < matchers.length; index++) {
        if (arguments[index + 1] !== undefined) break;
      }
      matcher = matchers[index]
      if (!parsed.args.length) { // 没有提供参数，丢给原生处理
        return raw
      } else if (matcher.handle) {
        return matcher.handle(parsed.args.shift())
      } else {
        args.push(parsed.args.shift())
        return raw // 没有 handle 则表示是原生支持的，丢给原生处理
      }
    })
  }
  args.unshift(arg);
  return args;
}

// 根据需要 extend 的参数重新生成 正则
function buildRegExp(regexps) {
  return new RegExp(regexps.map(stringifyRegExp).join('|'), 'g')
}

// 将用户提供的正则转化成字符串，并去掉首尾以提供给新的正则使用
function stringifyRegExp(regexp) {
  return '(' + regexp.toString().replace(/^\/|\/\w*$/g, '') + ')'
}


module.exports = extend
