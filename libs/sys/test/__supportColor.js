var assert = require('assert')
var rewire = require('rewire')

var supportColor = rewire('../supportColor')

/* eslint-env mocha */
describe('libs/sys/supportColor', function() {
  it('should return true in a TTY environment', function() {
    var off = supportColor.__set__({ env: {} })
    var result = supportColor({ isTTY: true })
    assert.strictEqual(result, true)
    off()
  })

  it('should return false in a non-TTY environment', function() {
    var off = supportColor.__set__({ env: {} })
    var result = supportColor({ isTTY: false })
    assert.strictEqual(result, false)
    off()
  })

  it('should return false in Windows environment with version lower than 10.0.14931', function() {
    var os = { release: function() { return '10.0.14393' } } // Windows version 10.0.14393
    var env = { CI: null }
    var off = supportColor.__set__({ env: env, os: os, isWin: true })
    var result = supportColor({ isTTY: true })
    assert.strictEqual(result, false)
    off()
  })

  it('should return true in Windows environment with version higher than 10.0.14931', function() {
    var os = { release: function() { return '10.0.14931' } } // Windows version 10.0.14931
    var env = { CI: null }
    var off = supportColor.__set__({ env: env, os: os, isWin: true })
    var result = supportColor({ isTTY: true })
    assert.strictEqual(result, true)
    off()
  })

  it('should return true in non-Windows environment', function() {
    var os = { release: function() { return 'Linux' } }
    var env = { CI: null }
    var off = supportColor.__set__({ env: env, os: os, isWin: false })
    var result = supportColor({ isTTY: true })
    assert.strictEqual(result, true)
    off()
  })

  it('should return true when FORCE_COLOR is set to true', function() {
    var env = { FORCE_COLOR: 'true' }
    var off = supportColor.__set__({ env: env })
    var result = supportColor({ isTTY: true })
    assert.strictEqual(result, true)
    off()
  })

  it('should return false when FORCE_COLOR is set to false', function() {
    var env = { FORCE_COLOR: 'false' }
    var off = supportColor.__set__({ env: env })
    var result = supportColor({ isTTY: true })
    assert.strictEqual(result, false)
    off()
  })

  it('should return true when FORCE_COLOR is set to an invalid value', function() {
    var env = { FORCE_COLOR: 'invalid' }
    var off = supportColor.__set__({ env: env })
    var result = supportColor({ isTTY: true })
    assert.strictEqual(result, true)
    off()
  })

  it('should return false in a CI environment without GITHUB_ACTIONS', function() {
    var env = { CI: 'true', GITHUB_ACTIONS: null }
    var off = supportColor.__set__({ env: env })
    var result = supportColor({ isTTY: true })
    assert.strictEqual(result, false)
    off()
  })

  it('should return true in a CI environment with GITHUB_ACTIONS', function() {
    var env = { CI: 'true', GITHUB_ACTIONS: 'true' }
    var off = supportColor.__set__({ env: env })
    var result = supportColor({ isTTY: true })
    assert.strictEqual(result, true)
    off()
  })
})
