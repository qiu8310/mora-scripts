/**
 * 文件缓存
 *
 * @module      libs/storage/FileStorage
 * @createdAt   2016-07-21
 *
 * @copyright   Copyright (c) 2016 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */

var Storage = require('./Storage')
var fs = require('fs')

module.exports = Storage.extend({
  init: function(data) {
    var self = this
    return new Promise(function(resolve, reject) {
      if (self.data) return resolve()

      fs.readFile(self.opts.file, function(err, content) {
        if (err) {
          if (err.code === 'ENOENT') {
            self.data = Object(data)
            return self.update().then(resolve, reject)
          } else {
            return reject(err)
          }
        } else {
          self.data = JSON.parse(content.toString().trim())
          resolve()
        }
      })
    })
  },

  initSync: function(data) {
    if (!this.data) {
      try {
        this.data = JSON.parse(fs.readFileSync(this.opts.file).toString().trim())
      } catch (e) {
        if (e.code === 'ENOENT') {
          this.data = Object(data)
          this.updateSync()
        } else {
          throw e
        }
      }
    }
  },

  update: function() {
    var self = this
    return new Promise(function(resolve, reject) {
      fs.writeFile(self.opts.file, self.toString(), function(err) {
        if (err) return reject(err)
        resolve()
      })
    })
  },

  updateSync: function() {
    fs.writeFileSync(this.opts.file, this.toString())
  }
})
