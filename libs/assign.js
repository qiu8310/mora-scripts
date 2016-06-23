/*
  参考了 https://github.com/sindresorhus/object-assign
  源版本还对 原生的 Object.assign 做了验证
  ( Detect buggy property enumeration order in older V8 versions )

  我这版本比较简单
 */

var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

module.exports = Object.assign || function (target) {
  if (target == null) throw new TypeError('Object.assign cannot be called with null or undefined')

  var i, j, k, from, to = Object(target)

  for (i = 1; i < arguments.length; i++) {
    from = Object(arguments[i]);

    for (k in from) {
      if (hasOwnProperty.call(from, k)) to[k] = from[k]
    }

    if (Object.getOwnPropertySymbols) {
      symbols = Object.getOwnPropertySymbols(from)
      for (j = 0; j < symbols.length; j++) {
        if (propIsEnumerable.call(from, symbols[j])) to[symbols[j]] = from[symbols[j]]
      }
    }
  }

  return to;
}

