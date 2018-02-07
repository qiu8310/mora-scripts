/**
 * 递归删除指定的文件夹或文件
 *
 * @module      libs/fs/rm
 * @createdAt   2016-08-05
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var fs = require('fs')
var path = require('path')
var warn = require('../sys/warn')

/**
 * 递归遍历删除指定的文件或文件夹
 * @param  {String} file 要删除的文件的路径
 */
function rm(file) {
  var stat
  try {
    stat = fs.statSync(file)
  } catch (e) {
    /* istanbul ignore else */
    if (e.message.indexOf('ENOENT') === 0) {
      return warn('file<' + file + '> not exists')
    }
    /* istanbul ignore next */
    throw e
  }

  if (stat.isDirectory()) {
    rmDir(file)
  } else {
    rmFile(file)
  }
}

function rmFile(file) {
  return fs.unlinkSync(file)
}

function rmDir(dir) {
  fs.readdirSync(dir).forEach(function(item) {
    rm(path.join(dir, item))
  })
  return fs.rmdirSync(dir)
}

module.exports = rm
