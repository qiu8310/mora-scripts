var os = require('os')
var sinon = require('sinon')
var rewire = require('rewire')
var assert = require('assert')

var validate = rewire('../commit-msg')

/* eslint-env mocha */

describe('hooks/commit-msg', function() {
  it('should return false when first line is empty', assertLog(function() {
    assert.equal(validate(''), false)
    assert.equal(validate(['', 'second'].join(os.EOL)), false)
  }, 'log', 'calledTwice', /Aborting commit due to empty commit message/))

  it('should return true when commit-msg is branches merge msg', assertLog(function() {
    assert.equal(validate('Merge xx'), true)
  }, 'log', 'calledOnce', /Merge commit detected/))

  it('should return true when commit-msg is version number or start with "WIP"', assertLog(function() {
    assert.equal(validate('WIP xxx'), true)
    assert.equal(validate('v2.0.0-alpha'), true)
  }, 'log', 'calledTwice', /Commit message validation ignored/))

  it('should report error when commit-msg not match `<type>(<scope>): <subject>` expression', assertLog(function() {
    assert.equal(validate('xx'), false)
    assert.equal(validate('yy'), false)
  }, 'error', 'calledTwice', /does not match "<type>\(<scope>\): <subject>"/))

  it('should report error when head commit-msg is too long', assertLog(function() {
    validate.__with__({
      config: {
        maxSubjectLength: 8,
        types: ['test'],
        warnOnFail: false
      }
    })(function() {
      assert.equal(validate('test: aaaaaaaa'), false)
    })
  }, 'error', 'calledOnce', /is longer than 8 characters/))

  it('should report warn when head commit-msg is too long and warnOnFail is true', assertLog(function() {
    validate.__with__({
      config: {
        maxSubjectLength: 8,
        types: ['test'],
        warnOnFail: true
      }
    })(function() {
      assert.equal(validate('test: aaaaaaaa'), true)
    })
  }, 'warn', 'calledOnce', /is longer than 8 characters/))

  it('should report error when head commit-msg type is not allowed', assertLog(function() {
    validate.__with__({
      config: {
        maxSubjectLength: 80,
        types: ['test'],
        warnOnFail: false
      }
    })(function() {
      assert.equal(validate('xx: aaaaaaaa'), false)
    })
  }, 'error', 'calledOnce', /"xx" is not allowed type/))

  it('should report error when commit-msg subject not match subject pattern', assertLog(function() {
    validate.__with__({
      config: {
        maxSubjectLength: 80,
        types: ['test'],
        subjectPattern: /aa/,
        warnOnFail: false
      }
    })(function() {
      assert.equal(validate('test: bb'), false)
    })
  }, 'error', 'calledOnce', /subject does not match subject pattern/))

  it('should report error when subject first letter is capitalize', assertLog(function() {
    validate.__with__({
      config: {
        maxSubjectLength: 80,
        types: ['test'],
        subjectPattern: /.+/,
        warnOnFail: false
      }
    })(function() {
      assert.equal(validate('test: AA'), false)
    })
  }, 'error', 'calledOnce', /don't capitalize first letter/))

  it('should report error when subject last letter is punctuation', assertLog(function() {
    validate.__with__({
      config: {
        maxSubjectLength: 80,
        types: ['test'],
        subjectPattern: /.+/,
        warnOnFail: false
      }
    })(function() {
      assert.equal(validate('test: aa.'), false)
    })
  }, 'error', 'calledOnce', /no punctuation mark at the end/))

  it('should output help message', function() {
    var log = sinon.stub(console, 'log')
    validate.help()
    assert.ok(log.calledWithMatch(/Git Commit Message Guides/))
    log.restore()
  })
})

function assertLog(callback, level, called, expecdMsg) {
  return function() {
    var log = sinon.stub(console, level || 'log')

    callback()

    if (expecdMsg) assert.ok(log.alwaysCalledWithMatch(expecdMsg), 'alwaysCalledWithMatch ' + expecdMsg)
    if (called) assert.ok(log[called], 'console.' + level + ' should ' + called)
    log.restore()
  }
}
