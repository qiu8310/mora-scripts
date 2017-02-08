var assert = require('assert')
var path = require('path')
var fs = require('fs')
var findup = require('../findup')
var resolve = path.resolve

/* eslint-env mocha */

var fsDir = resolve(path.dirname(__dirname))
var currentDir = process.cwd()
var fixturesDir = resolve(__dirname, './fixtures')
var notExistsKey = '__not__exists__'

describe('libs/fs/findup', function() {
  describe('findup', function() {
    context('found', function() {
      it('should return lookuped directory', function() {
        assert.equal(findup(fsDir, 'findup.js'), fsDir, fsDir + ' should contains findup.js')
      })
    })

    context('not found', function() {
      it('should throws when directory can not found', function() {
        assert.throws(function() {
          findup(fsDir, notExistsKey)
        }, /Not found/)
      })
    })

    context('iteratorSync is function', function() {
      it('should return the lookuped directory which iteratorSync function returns true', function() {
        var found = findup(__dirname, function(dir) {
          if (dir === fsDir) return true
        })

        assert.equal(found, fsDir)
      })
    })

    context('with opts.allowTypes', function() {
      it('should support specify directory to lookup', function() {
        var found = findup(fsDir, 'test', {allowTypes: 'directory'}) // test is a directory
        assert.equal(found, fsDir)
      })
    })

    context('with opts.maxdepth', function() {
      it('should return current dir if it contains current file', function() {
        var found = findup(__dirname, path.basename(__filename), {maxdepth: 1})
        assert.equal(found, __dirname)
      })

      it('should throws when file in parent dir and maxdepth is 1', function() {
        assert.throws(function() { findup(__dirname, 'findup.js', {maxdepth: 1}) }, /Not found/)
        assert.doesNotThrow(function() { findup(__dirname, 'findup.js', {maxdepth: 2}) })
      })
    })
  })

  describe('findup.dir', function() {
    it('should return the found directory, not the lookuped directory', function() {
      var found = findup.dir(currentDir, 'libs')
      assert.equal(found, path.join(currentDir, 'libs'))
    })

    it('should use current process directory as root directory, if there is only one argument', function() {
      var found = findup.dir('libs')
      assert.equal(found, path.join(currentDir, 'libs'))
    })
  })

  describe('findup.file', function() {
    it('should return the found file, not the lookuped directory', function() {
      var found = findup.file(__dirname, path.basename(__filename))
      assert.equal(found, __filename)
    })
  })

  describe('findup.git', function() {
    it('should return the .git directory in root directory', function() {
      var found
      try {
        found = findup.git()
      } catch (e) {}

      if (found) { // appveyor 下没有 .git 目录
        assert.equal(found, path.join(currentDir, '.git'))
      }
    })

    it('should return the .git directory inside the .git file', function() {
      var gitFile = path.join(fixturesDir, '.git')
      fs.writeFileSync(gitFile, 'gitdir: ' + fsDir)

      var found = findup.git(fixturesDir)
      fs.unlinkSync(path.join(fixturesDir, '.git'))

      assert.equal(found, fsDir)
    })
  })

  describe('findup.pkg', function() {
    it('should return the package.json file path', function() {
      var found = findup.pkg()
      assert.equal(found, path.join(currentDir, 'package.json'))
    })
  })
})
