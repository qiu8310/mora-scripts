var assert = require('assert')
var rewire = require('rewire')

var addEnvPath = rewire('../addEnvPath')

/* eslint-env mocha */

describe('libs/sys/addEnvPath', function() {
  beforeEach(function() {
    addEnvPath.__set__('isWin', false)
  })

  it('should return the modified env', function() {
    var env = {}
    assert.equal(env, addEnvPath(env, 'bb'))
  })

  it('should use ":" as separator on none windows platform', function() {
    addEnvPath.__set__('isWin', false)
    assert.equal(addEnvPath({PATH: 'aa'}, 'bb').PATH, 'bb:aa')
  })

  it('should use ";" as separator on windows platform', function() {
    addEnvPath.__set__('isWin', true)
    assert.equal(addEnvPath({PATH: 'aa'}, 'bb').PATH, 'bb;aa')
  })

  it('should support add multiple path', function() {
    assert.equal(addEnvPath({PATH: 'a'}, ['b', 'c']).PATH, 'b:c:a')
  })

  it('should add PATH to env when no PATH in it', function() {
    var env = addEnvPath({}, 'bb')
    assert.equal(env.PATH, 'bb')
  })

  it('should found first case insensitive "PATH" variable in windows platform', function() {
    addEnvPath.__set__('isWin', true)
    var env = addEnvPath({pat: 'n', pAth: 'a', ath: 'n'}, 'b')
    assert.equal(env.pAth, 'b;a')
  })
})
