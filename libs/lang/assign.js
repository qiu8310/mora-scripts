/**
 * @module      libs/lang/assign
 * @createdAt   2016-06-30
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var hasOwnProperty = Object.prototype.hasOwnProperty
var propIsEnumerable = Object.prototype.propertyIsEnumerable

/**
 *
 * 原生的 Object.assign 的一个 polyfill
 *
 * Node v4 以前基本上都不支持 Object.assign 这个方法，此方法是 sindresorhus 写
 * 的 object-assign 的一个简化版，源版本还对原生的 Object.assign 做了 bug detect
 * ( Detect buggy property enumeration order in older V8 versions )，我这个
 * 版本相对简单点
 *
 * @param     {Object} target     要赋值到的对象
 * @param     {...Object} source  源对象，可以有多个
 * @throws    {TypeError}         如果第一个参数是 null 或者 undefined
 * @return    {Object}
 *
 * @example
 * assign({}, {a: '1', b: 2}, null, true, {a: 1})
 *
 * @see       [object-assign@4.1.0]{@link https://github.com/sindresorhus/object-assign/tree/v4.1.0}
 * @author    Zhongle Qiu
 * @since     2.0.0
 */
module.exports = function(target, source) {
  if (target == null) throw new TypeError('Object.assign cannot be called with null or undefined')

  var i, j, k, from, symbols
  var to = Object(target)

  for (i = 1; i < arguments.length; i++) {
    from = Object(arguments[i])

    for (k in from) {
      if (hasOwnProperty.call(from, k)) to[k] = from[k]
    }

    /* istanbul ignore else */
    if (Object.getOwnPropertySymbols) {
      symbols = Object.getOwnPropertySymbols(from)
      for (j = 0; j < symbols.length; j++) {
        if (propIsEnumerable.call(from, symbols[j])) to[symbols[j]] = from[symbols[j]]
      }
    }
  }

  return to
}
