/**
 * 纯内存缓存
 *
 * @module      libs/storage/Storage
 * @createdAt   2016-07-21
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */
var extend = require('../lang/classExtend').extend
var hasOwnProp = require('../lang/hasOwnProp')

/**
 * @class
 * @param {Object} opts 配置项，具体配置由具体子类决定
 * @param {Number} opts.format 指定 toString 调用 JSON.stringify 时的格式
 * @param {Boolean} opts.autoInit 在 constructor 内部调用 this.initSync 方法
 *
 * @example
 *
 * Storage.extend({
 *
 *   // 注意，不能写成 constructor() { }，这种写法
 *   // 等价于 constructor: function constructor () {}
 *   // 这样会导致无法使用 new 来创建新生成的类
 *
 *   constructor: function () {
 *     Storage.apply(this, arguments)
 *   },
 *
 *   init: function (data) {}
 *   initSync: function (data) {}
 *   update: function () {}
 *   updateSync: function () {}
 * })
 *
 */
function Storage(opts) {
  /**
   * 内存中的所有数据
   * @type {Object}
   */
  this.data = null

  /**
   * 选项
   * @type {Object}
   */
  this.opts = Object(opts)

  if (this.opts.autoInit) {
    this.initSync()
  }
}

/**
 * @borrows module:libs/lang/classExtend~Base.extend
 * @type {Function}
 */
Storage.extend = extend

/**
 * 对指定的 key 做 defineProperty 操作，之后就可以通过
 * storage.key 或 storage.key = 'xx' 的形式来对 stroage
 * 中的数据进行修改。
 *
 * 主要是采用了 Storage.getSync 和 Storage.setSync 方法
 *
 * @param  {Array<String>|String} [keys]   要操作的 keys，如果不指定，则会对 data 中的所有 keys 处理
 * @param  {Boolean}              silent   是否禁止输出提醒信息（主要是 defineProperty 会出现 key 已经存在的问题）
 * @return {Storage}
 */
Storage.prototype.define = function(keys, silent) {
  if (typeof keys === 'string') {
    keys = [keys]
  } else if (!Array.isArray(keys)) {
    silent = !!keys
    keys = Object.keys(this.data)
  }

  keys.forEach(function(key) {
    _define(this, key, silent)
  }, this)

  return this
}

/**
 * 初始化 Storage
 * @return {Promise}
 */
Storage.prototype.init = function(data) {
  this.data = Object(data)
  return Promise.resolve()
}

/**
 * Stroage#init 的同步版本
 */
Storage.prototype.initSync = function(data) {
  this.data = Object(data)
}

/**
 * 判断 key 是否存在
 * @param  {String} key
 * @return {Promise}
 */
Storage.prototype.has = function(key) {
  return Promise.resolve(this.hasSync(key))
}

/**
 * Storage.has 的同步版本
 * @param  {String} key
 * @return {*}
 */
Storage.prototype.hasSync = function(key) {
  return hasOwnProp(this.data, key)
}

/**
 * 获取指定的 key 的值
 * @param  {String} key
 * @return {Promise}
 */
Storage.prototype.get = function(key) {
  return Promise.resolve(this.getSync(key))
}

/**
 * Storage.get 的同步版本
 * @param  {String} key
 * @return {*}
 */
Storage.prototype.getSync = function(key) {
  return this.data[key]
}

/**
 * 安全的操作 key，如果操作 key 失败，会将 key 上的值回滚到操作之前的值
 * @param  {String}   key
 * @param  {Function} op        操作函数
 * @param  {Boolean}  sync      是否是同步操作
 * @return {*}     操作函数返回的内容
 */
Storage.prototype.safeOperate = function(key, op, sync) {
  var data = this.data
  var oldVal = data[key]

  op.call(this, data, key)

  if (sync) {
    try {
      return this.updateSync()
    } catch (e) {
      data[key] = oldVal
      throw e
    }
  } else {
    return this.update()
      .catch(function(e) {
        data[key] = oldVal
        return Promise.reject(e)
      })
  }
}

/**
 * 设定值
 * @param {String} key
 * @param {*} val
 * @return {Promise}
 */
Storage.prototype.set = function(key, val) {
  return this.safeOperate(key, function(data, key) {
    data[key] = val
  })
}

/**
 * Storage.set 的同步版本
 * @param  {String} key
 * @param  {*} val
 */
Storage.prototype.setSync = function(key, val) {
  return this.safeOperate(key, function(data, key) {
    data[key] = val
  }, true)
}

/**
 * 删除某个 key
 * @param  {String} key
 * @return {Promise}
 */
Storage.prototype.del = function(key) {
  return this.safeOperate(key, function(data, key) {
    delete data[key]
  })
}

/**
 * Storage.del 的同步版本
 * @param  {String} key
 */
Storage.prototype.delSync = function(key) {
  return this.safeOperate(key, function(data, key) {
    delete data[key]
  }, true)
}

/**
 * 将数据同步到对应的存储中
 * @return {Promise}
 */
Storage.prototype.update = function() {
  return Promise.resolve()
}

/**
 * Storage.update 的同步版本
 * @return {Promise}
 */
Storage.prototype.updateSync = function() {}

/**
 * 将 Storage 中的 data 克隆
 * @return {*}
 */
Storage.prototype.toJSON = function() {
  return JSON.parse(this.toString())
}

/**
 * 将 Storage 中的 data 转化成字符串
 * @return {String}
 */
Storage.prototype.toString = function() {
  return JSON.stringify(this.data, null, this.opts.format)
}

module.exports = Storage

// 不能取名为 define
// webpack 认为 define 是 全局变量，AMD 模块有 define('xxx', function) 写法
function _define(target, key, silent) {
  if (key in target.constructor.prototype) {
    if (!silent) {
      console.warn('WARN: ignore defineProperty "'
        + key + '", because it is Storage\'s native method.')
    }
  } else if (key in target) {
    if (!silent) {
      console.warn('INFO: ignore defineProperty "'
        + key + '", because the property already exists.')
    }
  } else {
    Object.defineProperty(target, key, {
      get: function() { return target.getSync(key) },
      set: function(v) { return target.setSync(key, v) }
    })
  }
}
