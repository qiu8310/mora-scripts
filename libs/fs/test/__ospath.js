var assert = require('assert')
var proxyquire = require('proxyquire')
var ospath = require('../ospath')

/* eslint-env mocha */

/* istanbul ignore next/if/else */

describe('ospath', function() {
  var env

  beforeEach(function() {
    env = {}
    Object.keys(process.env).forEach(function(key) {
      env[key] = process.env[key]
    })
  })

  afterEach(function() {
    process.env = env
  })

  describe('data()', function() {
    describe('> when linux', function() {
      it('should return a string value', function() {
        ospath.__platform = 'linux'
        process.env.HOME = '/some/linux/home'
        delete process.env.XDG_CONFIG_HOME
        assert.equal(ospath.data(), '/some/linux/home/.config')
      })

      describe('> when XDG_CONFIG_HOME is set', function() {
        it('should return a string value', function() {
          ospath.__platform = 'linux'
          process.env.HOME = '/some/linux/home'
          process.env.XDG_CONFIG_HOME = '/tmp/config'
          assert.equal(ospath.data(), '/tmp/config')
        })
      })
    })

    describe('> when darwin', function() {
      it('should return a string value', function() {
        // set HOME var
        process.env.HOME = '/some/darwin/home'
        // set os.homedir()
        var stub = {os: {homedir: function() { return '/some/darwin/home' }}}
        ospath = proxyquire('../ospath', stub)
        ospath.__platform = 'darwin'
        assert.equal(ospath.data(), '/some/darwin/home/Library/Application Support')
      })
    })

    describe('> when win32', function() {
      it('should return a string value', function() {
        ospath.__platform = 'win32'
        // windows specific
        process.env.APPDATA = '/some/win32/appdata'
        assert.equal(ospath.data(), '/some/win32/appdata')
      })
    })
  })

  describe('desktop()', function() {
    describe('> when linux', function() {
      it('should return a string value', function() {
        // set $HOME
        process.env.HOME = '/some/linux/home'
        // set os.homedir()
        var stub = {os: {homedir: function() { return process.env.HOME }}}
        ospath = proxyquire('../ospath', stub)
        ospath.__platform = 'linux'
        assert.equal(ospath.desktop(), '/some/linux/home/Desktop')
      })
    })

    describe('> when darwin', function() {
      it('should return a string value', function() {
        process.env.HOME = '/some/darwin/home'
        var stub = {os: {homedir: function() { return process.env.HOME }}}
        ospath = proxyquire('../ospath', stub)
        ospath.__platform = 'darwin'
        assert.equal(ospath.desktop(), '/some/darwin/home/Desktop')
      })
    })

    describe('> when win32', function() {
      it('should return a string value', function() {
        process.env.USERPROFILE = '/some/win32/home'
        var stub = {os: {homedir: function() { return process.env.USERPROFILE }}}
        ospath = proxyquire('../ospath', stub)

        ospath.__platform = 'win32'
        // windows specific
        assert.equal(ospath.desktop(), '/some/win32/home/Desktop')
      })
    })
  })

  describe('home()', function() {
    describe('> when linux', function() {
      it('should return a string value', function() {
        // set $HOME
        process.env.HOME = '/some/linux/home'
        // set os.homedir()
        var stub = {os: {homedir: function() { return '/some/linux/home' }}}
        ospath = proxyquire('../ospath', stub)
        ospath.__platform = 'linux'
        assert.equal(ospath.home(), '/some/linux/home')
      })
    })

    describe('> when darwin', function() {
      it('should return a string value', function() {
        process.env.HOME = '/some/darwin/home'
        var stub = {os: {homedir: function() { return process.env.HOME }}}
        ospath = proxyquire('../ospath', stub)
        ospath.__platform = 'darwin'
        assert.equal(ospath.home(), '/some/darwin/home')
      })
    })

    describe('> when win32', function() {
      it('should return a string value', function() {
        process.env.USERPROFILE = '/some/win32/home'
        var stub = {os: {homedir: function() { return process.env.USERPROFILE }}}
        ospath = proxyquire('../ospath', stub)

        ospath.__platform = 'win32'
        // windows specific
        assert.equal(ospath.home(), '/some/win32/home')
      })
    })

    describe('> when os.homedir()', function() {
      it('should return results of os.homedir()', function() {
        var stub = {os: {homedir: function() { return '/somedir' }}}
        ospath = proxyquire('../ospath', stub)
        assert.equal(ospath.home(), '/somedir')
      })
    })
  })

  describe('tmp()', function() {
    describe('> when linux', function() {
      it('should return a string value', function() {
        ospath.__platform = 'linux'
        assert.equal(ospath.tmp(), '/tmp')
      })
    })

    describe('> when darwin', function() {
      it('should return a string value', function() {
        ospath.__platform = 'darwin'
        assert.equal(ospath.tmp(), '/tmp')
      })
    })

    describe('> when win32', function() {
      it('should return a string value', function() {
        ospath.__platform = 'win32'
        // windows specific
        process.env.TEMP = '/some/temp/path/on/windows'
        assert.equal(ospath.tmp(), '/some/temp/path/on/windows')
      })
    })
  })
})
