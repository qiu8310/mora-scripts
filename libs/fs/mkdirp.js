/**
 *
 * @module      libs/fs/mkdirp
 * @createdAt   2016-08-05
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var fs = require('fs')
var path = require('path')

var o777 = parseInt('0777', 8)

/**
 * 创建目录
 *
 * 如果上级目录不存在，也会创建，类似于 Linux 的 mkdirp
 * @param   {String}        p        要创建的目录
 * @param   {Object|Number} opts      配置或者直接指定要创建的目录的
 * @param   {Number}        opts.mode
 * @param   {Object}        opts.fs
 * @return  {String}
 */
module.exports = function mkdirp(p, opts, made) {
  if (!opts || typeof opts !== 'object') {
    opts = { mode: opts }
  }

  var mode = opts.mode
  var xfs = opts.fs || fs

  if (mode === undefined) {
    mode = o777 & (~process.umask())
  }
  if (!made) made = null

  p = path.resolve(p)

  try {
    xfs.mkdirSync(p, mode)
    made = made || p
  } catch (err0) {
    switch (err0.code) {
      case 'ENOENT':
        /* istanbul ignore if */
        if (path.dirname(p) === p) throw err0
        made = mkdirp(path.dirname(p), opts, made)
        mkdirp(p, opts, made)
        break

      // In the case of any other error, just see if there's a dir
      // there already.  If so, then hooray!  If not, then something
      // is borked.
      default:
        var stat
        try {
          stat = xfs.statSync(p)
        } catch (err1) {
          /* istanbul ignore next */
          throw err0
        }
        /* istanbul ignore else */
        if (!stat.isDirectory()) throw err0
    }
  }

  return made
}
