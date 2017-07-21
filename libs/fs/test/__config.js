var assert = require('assert')
var path = require('path')
var rewire = require('rewire')
var config = rewire('../config')

/* eslint-env mocha */

/* istanbul ignore next/if/else */

describe('libs/fs/config', function() {
  context('chdir', function() {
    var _cwd = process.cwd()
    beforeEach(function() {
      process.chdir(path.join(__dirname, 'fixtures', 'config'))
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

    it('should merge two config', function() {
      var data = config('.eslintrc', {merge: true})
      assert.deepEqual(data.env, false)
      assert.deepEqual(data.globals, {Promise: true })
    })

    it('should warn on invalid json file', function(done) {
      var revert = config.__set__('warn', function(msg) {
        assert(msg.indexOf('Unexpected token') > 0)
        done()
      })
      config('warn')
      revert()
    })
  })

  context('no chdir', function() {
    it('should get root package.json', function() {
      assert.equal(config('package').name, 'mora-scripts')
    })
  })
})

