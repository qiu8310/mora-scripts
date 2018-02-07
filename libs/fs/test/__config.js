var assert = require('assert')
var path = require('path')
var fs = require('fs')
var rewire = require('rewire')
var config = rewire('../config')

/* eslint-env mocha */

/* istanbul ignore next/if/else */

describe('libs/fs/config', function() {
  context('chdir', function() {
    var _cwd = process.cwd()
    var configDir
    beforeEach(function() {
      configDir = path.join(__dirname, 'fixtures', 'config')
      process.chdir(configDir)
    })
    afterEach(function() {
      process.chdir(_cwd)
    })

    it('should get js config', function() {
      assert.deepEqual(config('config1'), {config: 1})
    })

    it('should get json config', function() {
      assert.deepEqual(config('config2'), {config: 2})
    })

    it('should get json cached config', function() {
      var configFile = path.join(configDir, 'config2.json')
      assert.deepEqual(config('config2'), {config: 2})
      fs.writeFileSync(configFile, JSON.stringify({config: 3}, null, 2))
      assert.deepEqual(config('config2'), {config: 2})
      assert.deepEqual(config('config2', {nocache: true}), {config: 3})
      assert.deepEqual(config('config2'), {config: 3})
      fs.writeFileSync(configFile, JSON.stringify({config: 2}, null, 2))
    })

    it('should merge two config', function() {
      var data = config('.eslintrc', {merge: true})
      assert.deepEqual(data.env, false)
      assert.deepEqual(data.globals, {Promise: true })
    })

    it('should warn on invalid json file', function(done) {
      var revert = config.__set__('warn', function(msg) {
        assert(msg.indexOf('Unexpected token') > 0)
        revert()
        done()
      })
      config('warn', {nocache: true})
    })
  })

  context('no chdir', function() {
    it('should get root package.json', function() {
      assert.equal(config('package').name, 'mora-scripts')
    })
  })
})

