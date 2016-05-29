/**
 * 扩展标准的 promise
 */


/**
 * Promise.prototype.finally
 *
 * 来自：http://es6.ruanyifeng.com/#docs/promise#finally
 */
if (!Promise.prototype.finally) {
  Promise.prototype.finally = function (callback) {
    var P = this.constructor;
    return this.then(
      function (value) { return P.resolve(callback()).then(function () { return value; })},
      function (reason) { return P.resolve(callback()).then(function () { throw reason; })}
    );
  };
}


/**
 * Promise.try
 *
 * 来自：Bluebird
 * 为什么要用它：http://cryto.net/~joepie91/blog/2016/05/11/what-is-promise-try-and-why-does-it-matter/
 */
if (!Promise.try) {
  Promise.try = function (fn) {
    return new Promise(function (resolve) {
      resolve(fn());
    });
  };
}
