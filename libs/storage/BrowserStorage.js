/**
 * 给浏览器用的缓存，利用了浏览器的 localStorage
 *
 * @module      libs/storage/BrowserStorage
 * @createdAt   2016-07-21
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var Storage = require('./Storage')

var _store = window.localStorage
try { // IE 8 或移动端的隐身模式 下直接调用 window.localStorage 会报错（其实也不用支持 IE8）
  _store.setItem('bs_:)_', '__')
  _store.removeItem('bs_:)_')
} catch (e) {
  /* istanbul ignore next */
  _store = null // 如果不支持，就保存在 cache 中
}

module.exports = Storage.extend({
  init: function(data) {
    var self = this
    return new Promise(function(resolve) {
      resolve(self.initSync(data))
    })
  },

  initSync: function(data) {
    if (_store) {
      var saved = _store.getItem(this.opts.key)
      if (saved) {
        try {
          saved = JSON.parse(saved)
        } catch (e) {
          saved = null
        }
      }
      this.data = saved || Object(data)
      this.updateSync()
    } else {
      console.warn('localStorage was disabled, your data will lost if refresh browser')
      this.data = Object(data)
    }
  },

  update: function() {
    var self = this
    return new Promise(function(resolve) {
      resolve(self.updateSync())
    })
  },

  updateSync: function() {
    if (_store) {
      _store.setItem(this.opts.key, this.toString())
    }
  }
})
