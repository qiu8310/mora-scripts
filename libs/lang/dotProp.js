/**
 * @module      libs/lang/dotProp
 * @createdAt   2016-06-30
 */

/*
  参考： https://github.com/sindresorhus/dot-prop
 */

module.exports = function (obj, path) {
  if (!isObj(obj) || typeof path !== 'string') {
    return obj
  }

  var pathArr = getPathSegments(path)

  for (var i = 0; i < pathArr.length; i++) {
    var descriptor = Object.getOwnPropertyDescriptor(obj, pathArr[i]) ||
                     Object.getOwnPropertyDescriptor(Object.prototype, pathArr[i])

    if (descriptor && !descriptor.enumerable) {
      return
    }

    obj = obj[pathArr[i]]

    if (obj === undefined || obj === null) {
      // `obj` is either `undefined` or `null` so we want to stop the loop, and
      // if this is not the last bit of the path, and
      // if it did't return `undefined`
      // it would return `null` if `obj` is `null`
      // but we want `get({foo: null}, 'foo.bar')` to equal `undefined` not `null`
      if (i !== pathArr.length - 1) {
        return
      }

      break
    }
  }

  return obj
}

function isObj (x) {
  var type = typeof x
  return x !== null && (type === 'object' || type === 'function')
}

function getPathSegments (path) {
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
