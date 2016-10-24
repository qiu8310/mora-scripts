/**
 * @module      libs/lang/DotProp
 * @createdAt   2016-07-01
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var hasOwnEnumProp = require('./hasOwnEnumProp')
var isObject = require('./isObject')

/**
 * 创建一个对象，使你可以通过 get/set/has/del 的方法来对其值
 * 做增删改查的操作，并且路径名支持 . 链接
 *
 * @class
 * @param {Objet} data  要操作的数据池
 *
 * @example
 * var dp = new DotProp({foo: {bar: 1}})
 * dp.has('foo.bar') // true
 * dp.get('foo')     // {bar: 1}
 * dp.set('x', 'x')  // true
 * dp.del('foo')     // true
 * dp.data           // {x: 'x'}
 *
 *
 * @see [dot-prop@3.0.0]{@link https://github.com/sindresorhus/dot-prop/tree/v3.0.0}
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
function DotProp(data) {
  if (!(this instanceof DotProp)) return new DotProp(data)
  this.data = Object(data)
}

/**
 * 获取数据池中路径为 path 的值
 * @param  {String} path  路径
 * @return {*}
 *
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
DotProp.prototype.get = function(path) {
  return DotProp.get(this.data, path)
}

/**
 * 设置数据池中路径为 path 的值，如果中间的路径不存在，
 * 或者不为 Object，则自动添加或修改成 Object
 *
 * @param  {String} path    路径
 * @param  {String} value   要设置的值
 * @return {Boolean}        是否设置成功（当 p 不为字符串时设置不成功）
 *
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
DotProp.prototype.set = function(path, value) {
  return DotProp.set(this.data, path, value)
}

/**
 * 判断数据池中是否有路径 path
 *
 * @param  {String}  path 路径
 * @return {Boolean}
 *
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
DotProp.prototype.has = function(path) {
  return DotProp.has(this.data, path)
}

/**
 * 删除数据池中的路径上的值
 * @param  {String} path  路径
 * @return {Boolean}      是否删除成功
 *
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
DotProp.prototype.del = function(path) {
  return DotProp.del(this.data, path)
}

/**
 * 判断数据池 obj 中是否有路径 path
 *
 * @static
 * @param  {Object}  obj  数据池
 * @param  {String}  path 路径
 * @return {Boolean}
 *
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
DotProp.has = function(obj, path) {
  if (!isObject(obj) || typeof path !== 'string') {
    return false
  }

  return find(obj, getPathSegments(path), function(data) {
    if (data.isDrained) {
      return {next: false, value: false}
    } else if (data.isLast) {
      return {next: false, value: true}
    } else {
      return {next: true}
    }
  })
}

/**
 * 获取数据池 obj 中的路径 path 中的值
 *
 * @static
 * @param  {Object}  obj  数据池
 * @param  {String}  path 路径
 * @return {*}       获取到的值或者 `undefined`
 *
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
DotProp.get = function(obj, path) {
  if (!isObject(obj) || typeof path !== 'string') {
    return obj
  }

  return find(obj, getPathSegments(path), function(data) {
    if (data.isDrained) {
      return {next: false, value: undefined}
    } else if (data.isLast) {
      return {next: false, value: data.current}
    } else {
      return {next: true}
    }
  })
}

/**
 * 删除数据池 obj 中的路径 path
 *
 * @static
 * @param  {Object}  obj  数据池
 * @param  {String}  path 路径
 * @return {Boolean} 是否删除成功
 *
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
DotProp.del = function(obj, path) {
  if (!isObject(obj) || typeof path !== 'string') {
    return false
  }

  return find(obj, getPathSegments(path), function(data) {
    if (data.isDrained) {
      return {next: false, value: false}
    } else if (data.isLast) {
      delete data.parent[data.segment]
      return {next: false, value: true}
    } else {
      return {next: true}
    }
  })
}

/**
 * 设置数据池 obj 中路径 path 的值为 value
 *
 * @static
 * @param  {Object}  obj   数据池
 * @param  {String}  path  路径
 * @param  {*}       value 要设置的值
 * @return {Boolean} 是否设置成功
 *
 * @author Zhonglei Qiu
 * @since 2.0.0
 */
DotProp.set = function(obj, path, value) {
  if (!isObject(obj) || typeof path !== 'string') {
    return false
  }

  return find(obj, getPathSegments(path), function(data) {
    var current = data.current
    var segment = data.segment
    if (data.isLast) {
      data.parent[segment] = value
      return {next: false, value: true}
    }

    if (!isObject(current)) {
      current = data.parent[segment] = {}
    }
    return {next: true, current: current}
  })
}

function find(obj, segments, fn) {
  var len = segments.length
  var parent = null
  var current = obj
  var isDrained = false
  var i, segment, fnRtn, result

  for (i = 0; i < len; i++) {
    segment = segments[i]

    parent = current
    if (hasOwnEnumProp(current, segment)) {
      current = current[segment]
    } else {
      current = null
      isDrained = true
    }

    fnRtn = fn({
      isLast: i === len - 1,
      isDrained: isDrained,
      segment: segment,
      parent: parent,
      current: current
    })

    result = fnRtn.value

    if (!fnRtn.next) break
    else if ('current' in fnRtn) current = fnRtn.current // 回调更新了 current 对象
  }

  return result
}

function getPathSegments(path) {
  var p
  var parts = []
  var pathArr = path.split('.')

  for (var i = 0; i < pathArr.length; i++) {
    p = pathArr[i]

    while (p[p.length - 1] === '\\' && pathArr[i + 1] !== undefined) {
      p = p.slice(0, -1) + '.'
      p += pathArr[++i]
    }

    parts.push(p)
  }

  return parts
}

module.exports = DotProp
