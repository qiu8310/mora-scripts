var util = require('util');

var PREFIX = '\x1b[', SUFFIX = 'm',
  RESET = PREFIX + '0' + SUFFIX,
  MODIFIERS = {
    bold: 1,      // 21  // 21 isn't widely supported and 22 does the same thing
    faint: 2,     // 22
    italic: 3,    // 23
    underline: 4, // 24
    reverse: 7    // 27
  },

  // 30-37 color;                   40-47 background
  // 90-97 high intensity color;  100-107 high intensity background
  NAMES = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];

  // 其它
  // 39 => default color;
  // 49 => default background;
  // 0  => reset

var re = /%([sdjc%])/g;

module.exports = format;
module.exports.autoReset = true;


// util.format 支持 %s %d %j %% 四个参数
// 此函数比 util.format 多个 %c 参数
//
// format('Are %cyou%c ok', 'color.red.bg.yellow', 'color.reset');
function format() {
  var i, current, group = [];
  for (i = 0; i < arguments.length; i++) {
    if (!current || current.count === 0) {
      if (current) {
        group.push(current);
      }
      current = parseStr(arguments[i]);
    } else {
      current.args.push(arguments[i]);
      current.count--;
    }
  }
  if (current && group.indexOf(current) < 0) group.push(current);

  var last = group.length - 1;
  return util.format.apply(util, group.reduce(function (args, current, i) {
    args.push.apply(args, compile(current, i === last));
    return args;
  }, []));
}

// 返回此字符串需要的参数和编译函数
function parseStr(str) {
  var res = {str: str, count: 0, args: []};
  if (typeof str === 'string') {
    str.replace(re, function (raw, char) {
      if (char !== '%') res.count++;
    });
  }
  return res;
}

// 处理 %c 参数
function compile(res, isLast) {
  var args = [];
  var str = res.str;
  if (typeof str === 'string') {
    str = str.replace(re, function (raw, char) {
      var val = res.args.shift();
      if (char === 'c') {
        return parseColor(val);
      } else if (char === '%') {
        return '%%';
      } else {
        args.push(val);
        return raw;
      }
    }) + (isLast && format.autoReset ? RESET : '');
  }
  args.unshift(str);
  return args;
}

// c. 或者 color. 表示设置前景色
// b. bg. 或者 background. 表示设置背景色
// h. l. 或者 high. low. 可以设置成使用 high intensity 相关的颜色
// 每次切换 color 或者 background 都会自动将 high 设置成 false (high intensity color 兼容性不好)
// 而 MODIFIERS 可以随便加，不加前缀时默认使用 color.
function parseColor(color) {
  if (typeof color !== 'string') return '';

  var bg = false;
  var high = false;

  return color
    .split(/[\.,;\s]+/)
    .map(function (raw) {
      var k = raw.toLowerCase();

      // 重置
      if (k === 'reset' || k === 'end') return 0;

      // 修改状态
      else if (k === 'c' || k === 'color') { bg = false; high = false; }
      else if (k === 'b' || k === 'bg' || k === 'background') { bg = true; high = false; }
      else if (k === 'h' || k === 'high') high = true;
      else if (k === 'l' || k === 'low') high = false;

      // 修改颜色
      else if (k in MODIFIERS) return MODIFIERS[k];
      else if (k[0] === 'r' && k.substr(1) in MODIFIERS) return 20 + MODIFIERS[k.substr(1)]; // reset modifier 兼容性不好，少用
      else if (k === 'default') return bg ? 49 : 39;
      else if (NAMES.indexOf(k) >= 0) return (high ? 60 : 0) + (bg ? 40 : 30) + NAMES.indexOf(k);
      else if (raw) return raw; // 用户可以自己直接写 ASCII 编码
    })
    .map(function (n) {
      return n == null || n === '' ? '' : PREFIX + n + SUFFIX
    })
    .join('');
}
