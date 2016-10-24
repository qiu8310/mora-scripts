/**
 * 扩展标准的 promise，包含下面两个方法
 *
 *   - Promise.prototype.finally
 *   - Promise.try
 *
 * @module      libs/lang/promiseExtra
 * @createdAt   2016-07-21
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

/**
 * Promise.prototype.finally
 *
 * @see {@link http://es6.ruanyifeng.com/#docs/promise#finally}
 */
/* istanbul ignore else */
if (!Promise.prototype.finally) {
  /* eslint-disable no-extend-native */
  Promise.prototype.finally = function(callback) {
    var P = this.constructor
    return this.then(
      function(value) { return P.resolve(callback()).then(function() { return value }) },
      function(reason) { return P.resolve(callback()).then(function() { throw reason }) }
    )
  }
  /* eslint-enable no-extend-native */
}

/**
 * Promise.try
 *
 * 来自：Bluebird
 *
 * @see [为什么要用它]{@link http://cryto.net/~joepie91/blog/2016/05/11/what-is-promise-try-and-why-does-it-matter/}
 */
/* istanbul ignore else */
if (!Promise.try) {
  Promise.try = function(fn) {
    return new Promise(function(resolve, reject) {
      resolve(fn())
    })
  }
}
