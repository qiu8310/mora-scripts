var assert = require('assert')
var sinon = require('sinon')
var Cli = require('rewire')('../cli')
var assign = require('../../lang/assign')

/* eslint-env mocha */

describe('libs/tty/cli', function() {
  describe('commands', function() {
    it('function command', function() {
      var spy = sinon.spy(function(res) {
        assert.deepEqual(res._, ['a', 'b'])
      })
      Cli().commands({s: spy}).parse(['s', 'a', 'b'])
      assert.equal(spy.callCount, 1)
    })

    it('command function with desc', function() {
      var spy = sinon.spy(function(res) {
        assert.deepEqual(res._, ['a', 'b'])
      })
      Cli().commands({s: {
        cmd: spy,
        desc: 'this is a sub command'
      }}).parse(['s', 'a', 'b'])

      assert.equal(spy.callCount, 1)
    })

    it('alias command', function() {
      var spy = sinon.spy()
      Cli().commands({'s | sub': spy}).parse(['s'])
      Cli().commands({'s | sub': {cmd: spy}}).parse(['sub'])

      testHelp(Cli().commands({'s | sub': spy}), function(message) {
        assert.ok(message.indexOf('s, sub') > 0)
      })

      assert.equal(spy.callCount, 2)
    })

    it('general command', function() {
      var count = 0
      var $command = ''
      var spy = function(res) {
        count++
        $command = res.$command
      }
      Cli().commands({'test:*': spy, 'abc': spy}).parse(['test'])
      Cli().commands({'test:*': spy}).parse(['test:abc'])
      assert.equal(count, 1)
      assert.equal($command, 'test:abc')
    })
    it('output desc', function() {
      testHelp(Cli().commands({s: {cmd: function() {}, desc: 'foo bar'}}), function(message) {
        assert.ok(message.indexOf('foo bar') > 0)
      })
    })
    it('hideInHelp', function() {
      testHelp(
        Cli().commands({
          aaa: {hideInHelp: true, cmd: function() {}},
          bbb: function() {}
        }),
        function(message) {
          assert.ok(!message.includes('aaa'))
          assert.ok(message.includes('bbb'))
        }
      )
    })
    it('sub cli commands', function() {
      var spy = sinon.spy(function(res) {
        assert.deepEqual(res._, ['a', 'b'])
        assert.equal(res.opt1, 'abc')
        assert.equal(!!res.opt2, false)
        assert.equal(res.opt3, 1)
      })
      Cli().commands({
        sub: {
          conf: {
            usage: 'sub cli command',
            version: '1.2.5'
          },
          options: {
            opt1: '<string> options 1',
            opt2: '<boolean> options 2'
          },
          groups: {
            groupName: {
              opt3: '<count> xxx'
            },
            empty: null
          },
          cmd: spy
        }
      }).parse(['sub', '--opt3', '--opt1', 'abc', 'a', 'b'])

      assert.equal(spy.callCount, 1)
    })

    it('bootstrap', function() {
      var fn = sinon.spy()
      Cli({
        bootstrap: fn
      }).parse(['---bootstrap'])
      assert.equal(fn.callCount, 1)
    })
    it('bootstrap invalid', function() {
      var fn = sinon.spy()
      Cli({
        bootstrap: fn
      }).parse(['----bootstrap'])
      assert.equal(fn.callCount, 0)
    })
    it('bootstrap no function', function() {
      var fn = sinon.spy()
      Cli({
        bootstrap: {}
      }).parse(['---bootstrap'], fn)
      assert.equal(fn.callCount, 1)
    })
    it('bootstrap noop', function() {
      var fn = sinon.spy()
      Cli({
      }).parse(['---bootstrap'], fn)
      assert.equal(fn.callCount, 1)
    })
    it('bootstrap sub1', function() {
      var fn1 = sinon.spy()
      var fn2 = sinon.spy()
      Cli({
        bootstrap: fn1
      }).commands({
        sub: {
          cmd: function() {},
          bootstrap: fn2
        }
      }).parse(['---bootstrap'], fn1)
      assert.equal(fn1.callCount, 1)
      assert.equal(fn2.callCount, 0)
    })
    it('bootstrap sub2', function() {
      var fn1 = sinon.spy()
      var fn2 = sinon.spy()
      Cli({
        bootstrap: fn1
      }).commands({
        sub: {
          cmd: function() {},
          conf: {
            bootstrap: fn2
          }
        }
      }).parse(['sub', '---bootstrap'], fn1)
      assert.equal(fn1.callCount, 0)
      assert.equal(fn2.callCount, 1)
    })
    it('bootstrap sub3', function() {
      var fn1 = sinon.spy()
      var fn2 = sinon.spy()
      Cli({
        bootstrap: fn1
      }).commands({
        sub: {
          cmd: function() {},
          conf: {
            bootstrap: fn2
          }
        }
      }).parse(['---bootstrap', 'sub'], fn1)
      assert.equal(fn1.callCount, 0)
      assert.equal(fn2.callCount, 1)
    })
    it('completion top', function() {
      function test(args, output) {
        var cli = Cli({version: false, help: false})
          .options({'a': '<str>', 'bb': '<bool>'})
          .commands({ c: function() {}, dd: function() {} })
        var log = sinon.stub(console, 'log')
        cli.parse(args)
        assert.deepStrictEqual(log.callCount, 1)
        assert.ok(log.calledWith(output))

        log.restore()
      }
      test(['---completion'], 'c\ndd')
      test(['---completion'], 'c\ndd')
      test(['---completion', 'c'], 'c')
      test(['---completion', 'd'], 'dd')
      test(['---completion', '-'], '-a\n--bb')
      test(['---completion', '--'], '--bb')

      test(['---completion', '-a', ''], '')
      test(['---completion', '-a', 'd'], '')
      test(['---completion', '--bb', ''], 'c\ndd')
      test(['---completion', '--bb', 'd'], 'dd')

      test(['---completion', '-a', 'ccc', ''], 'c\ndd')
      test(['---completion', '-a', 'ddd', ''], 'c\ndd')
      test(['---completion', '-a', 'a', '--', ''], 'c\ndd')
      test(['---completion', '-a', '--b', ''], 'c\ndd')
    })
    it('completion sub', function() {
      function test(args, output) {
        var cli = Cli({version: false, help: false})
          .commands({
            c: function(res) {
              Cli({ version: false, help: false })
                .options({ 'c1': '<str>', 'c2': '<bool>' })
                .parse(res._)
            },
            dd: function(res) {
              Cli({ version: false, help: false })
                .commands({ 'd1': function() {}, 'd2': function() {} })
                .parse(res._)
            }
          })
        var log = sinon.stub(console, 'log')
        cli.parse(args)
        assert.deepStrictEqual(log.callCount, 1)
        assert.ok(log.calledWith(output))
        log.restore()
      }
      test(['---completion', 'c'], 'c')
      test(['---completion', 'c', ''], '')
      test(['---completion', 'c', '--'], '--c1\n--c2')
      test(['---completion', 'c', '--c'], '--c1\n--c2')
      test(['---completion', 'c', '--c1'], '--c1')
      test(['---completion', 'c', '--c12'], '')

      test(['---completion', 'dd', ''], 'd1\nd2')
      test(['---completion', 'dd', 'c'], '')
      test(['---completion', 'dd', 'd'], 'd1\nd2')
      test(['---completion', 'dd', 'd1'], 'd1')
      test(['---completion', 'dd', 'd11'], '')
    })
    it('completion func', function() {
      function test(args, output1, output2) {
        var spy1 = sinon.spy(function(arg) {
          assert.deepEqual(arg, output1)
        })
        var spy2 = sinon.spy(function(arg) {
          assert.deepEqual(arg, output2)
        })
        var cli = Cli({version: false, help: false, completion: spy1 })
          .commands({
            c: function(res) {
              Cli({ version: false, help: false, completion: spy2 })
                .commands({ 'c1': function() {}, 'c2': function() {} })
                .parse(res._)
            }
          })
        cli.parse(args)
        assert.deepStrictEqual(spy1.callCount, output1 ? 1 : 0)
        assert.deepStrictEqual(spy2.callCount, output2 ? 1 : 0)
      }

      test(['---completion'], ['c'])
      test(['---completion', 'c'], ['c'])
      test(['---completion', 'c', ''], null, ['c1', 'c2'])
      test(['---completion', 'c', 'c'], null, ['c1', 'c2'])
      test(['---completion', 'c', 'c1'], null, ['c1'])
      test(['---completion', 'c', 'c11'], null, [])
    })
    it('command and options group', function() {
      testHelp(
        Cli().commands({
          a1: { cmd: function() {}, group: 'aa' },
          a2: { cmd: function() {}, group: 'aa' },
          b1: { cmd: function() {}, group: 'bb', hideInHelp: true },
          b2: { cmd: function() {}, group: 'bb', hideInHelp: true },
          c1: { cmd: function() {} },
          c2: { cmd: function() {} }
        }).options({
          d1: { type: 'boolean', group: 'dd' },
          d2: { type: 'boolean', group: 'dd' }
        }),
        function(message) {
          var keys = ['aa', 'a1', 'a2', 'bb', 'b1', 'b2', 'c1', 'c2', 'd1', 'd2', 'dd']
          keys.forEach(function(key) {
            if (key.startsWith('b')) {
              assert.ok(message.indexOf(key) < 0)
            } else {
              assert.ok(message.indexOf(key) >= 0)
            }
          })
        }
      )
    })
  })

  describe('options', function() {
    it('not sort options keys', function() {
      var opts = {
        'b | a | c': '<bool>'
      }
      var c = Cli().options(opts)
      var str = c.help(true)
      assert(str.includes('-b, -a, -c'))
    })

    it('undefined', function() {
      var opts = {
        b: '<bool>',
        s: '<string>'
      }
      Cli().options(opts).parse(['-b'], function(res) {
        assert(('b' in res))
        assert(!('s' in res))
      })
    })
    it('bool', function() {
      var opts = {
        a: '<bool>',
        b: '<boolean>',
        'c | cc': '<boolean>',
        d: {
          type: 'boolean',
          defaultValue: true
        },
        e: {
          type: 'bool',
          defaultValue: false
        }
      }

      testOptions(opts, ['-a', '-b'], {a: true, b: true, c: undefined, cc: undefined, d: true, e: false})
      testOptions(opts, ['-a', 'true', '-b', 'false'], {a: true, b: false, c: undefined, cc: undefined, d: true, e: false})
      testOptions(opts, ['-ab'], {a: true, b: true, c: undefined, cc: undefined, d: true, e: false})
      testOptions(opts, ['-abcd', '-e'], {a: true, b: true, c: true, cc: true, d: true, e: true})
    })
    it('fix boolean error', function() {
      var opts = {
        a: '<bool>'
      }
      assert.deepEqual(testOptions(opts, ['-a', 'a', 'b'], {a: true}), ['a', 'b'])
      assert.deepEqual(testOptions(opts, ['-a=true', 'a', 'b'], {a: true}), ['a', 'b'])
      assert.deepEqual(testOptions(opts, ['-a', 'true', 'b'], {a: true}), ['b'])
      assert.deepEqual(testOptions(opts, ['-a=false', 'true', 'b'], {a: false}), ['true', 'b'])

      opts = {
        a: '<bstr>'
      }
      assert.deepEqual(testOptions(opts, ['-a', 'a', 'b'], {a: 'a'}), ['b'])
      assert.deepEqual(testOptions(opts, ['-a=true', 'a', 'b'], {a: true}), ['a', 'b'])
      assert.deepEqual(testOptions(opts, ['-a', 'true', 'b'], {a: true}), ['b'])
      assert.deepEqual(testOptions(opts, ['-a=false', 'true', 'b'], {a: false}), ['true', 'b'])
    })
    it('str', function() {
      var opts = {
        a: '<str>',
        b: '<string>',
        'c | cc': '<string>',
        d: {
          type: 'string',
          defaultValue: 'd'
        },
        e: {
          type: 'str',
          defaultValue: 'e'
        }
      }
      testOptions(opts, ['-a', 'a', '-b', 'b'], {a: 'a', b: 'b', c: undefined, cc: undefined, d: 'd', e: 'e'})
      testOptions(opts, ['-c', 'c', '-d', 'dd'], {b: undefined, c: 'c', cc: 'c', d: 'dd', e: 'e'})
      testOptions(opts, ['-c', 'c', '-e', 'ee'], {b: undefined, c: 'c', cc: 'c', d: 'd', e: 'ee'})
    })
    it('bstr', function() {
      var opts = {
        a: '<bstr>',
        b: '<bstring>',
        c: {
          type: 'bstr'
        },
        d: {
          type: 'bstring'
        }
      }
      testOptions(opts, ['-a', 'a', '-c', 'c'], {a: 'a', b: undefined, c: 'c', d: undefined})
      testOptions(opts, ['-b', '-d'], {a: undefined, b: true, c: undefined, d: true})
      testOptions(opts, ['-b', 'true', '-d'], {a: undefined, b: true, c: undefined, d: true})
      testOptions(opts, ['-b', 'false', '-d'], {a: undefined, b: false, c: undefined, d: true})
    })
    it('bstr with equal', function() {
      var opts = {
        a: '<bstr>',
        aa: '<bstr>',
        b: '<bstr>',
        bb: '<bstr>'
      }
      Cli().options(opts).parse(['-a=true', '--aa=yes', '-b=no', '--bb=false'], function(res) {
        assert(res.a === true)
        assert(res.aa === 'yes')
        assert(res.b === 'no')
        assert(res.bb === false)
      })
    })
    it('bnum', function() {
      var opts = {
        a: '<bnum>',
        b: '<bnumber>',
        c: {
          type: 'bnum'
        },
        d: {
          type: 'bnumber'
        }
      }
      testOptions(opts, ['-a', '1', '-c', '2'], {a: 1, b: undefined, c: 2, d: undefined})
      testOptions(opts, ['-b', '-d'], {a: undefined, b: true, c: undefined, d: true})
      testOptions(opts, ['-b', 'true', '-d'], {a: undefined, b: true, c: undefined, d: true})
      testOptions(opts, ['-b', 'false', '-d'], {a: undefined, b: false, c: undefined, d: true})
    })
    it('bnum with equal', function() {
      var opts = {
        a: '<bnum>',
        aa: '<bnum>',
        b: '<bnum>',
        bb: '<bnum>'
      }
      Cli().options(opts).parse(['-a=true', '--aa=1', '-b=0', '--bb=false'], function(res) {
        assert(res.a === true)
        assert(res.aa === 1)
        assert(res.b === 0)
        assert(res.bb === false)
      })
    })
    it('count', function() {
      var opts = {
        a: '<count>',
        b: {
          type: 'count',
          defaultValue: 1
        }
      }
      testOptions(opts, ['-a'], {a: 1, b: 1})
      testOptions(opts, ['-aaa'], {a: 3, b: 1})
      testOptions(opts, ['-a', '-a', '-a'], {a: 3, b: 1})
      testOptions(opts, ['-b', '-b', '-b'], {a: undefined, b: 3})
    })
    it('arr', function() {
      var opts = {
        a: '<arr>',
        b: '<array>'
      }
      testOptions(opts, ['-a', '-b', '1', '-b', '2'], {a: [], b: ['1', '2']})
    })
    it('num', function() {
      var opts = {
        a: '<number>',
        b: '<num>',
        c: {
          type: 'number',
          defaultValue: 2
        },
        d: {
          type: 'num'
        }
      }
      testOptions(opts, '-a20', {a: 20, b: undefined, c: 2, d: undefined})
      testOptions(opts, '-a 20 -d 10.2', {a: 20, b: undefined, c: 2, d: 10.2})
      testOptions(opts, '-c 10.2', {a: undefined, b: undefined, c: 10.2, d: undefined})

      var cli = Cli().options(opts).parse(['-f20'])
      assert.deepEqual(cli._, ['-f20'])
    })

    it('group options', function() {
      var spy = sinon.spy(function(res) {
        assert.ok(res.a)
        assert.ok(res.b)
      })
      Cli()
        .options({a: '<bool>'})
        .options('xxx', {b: '<bool>'})
        .parse(['-a', '-b'], spy)

      assert.ok(spy.calledOnce)
    })

    it('hideInHelp', function() {
      testHelp(
        Cli()
          .options({aaa: '!<bool>', bbb: '<bool>', eee: { hideInHelp: true, type: 'bool' }})
          .options('xxx', {ccc: '!<bool>', ddd: '<boolean>'}),
        function(message) {
          assert.ok(message.includes('bbb'))
          assert.ok(message.includes('ddd'))
          assert.ok(!message.includes('aaa'))
          assert.ok(!message.includes('ccc'))
          assert.ok(!message.includes('eee'))
        }
      )
    })

    it('should output group header in help message', function() {
      testHelp(Cli().options({a: '<bool>'}).options('foo', {b: '<bool>'}), function(message) {
        assert.ok(message.indexOf('foo') > 0)
      })

      testHelp(Cli().options('empty group', {}), function(message) {
        assert.ok(message.indexOf('empty group') < 0)
      })
    })

    it('should output default value in help message', function() {
      testHelp(Cli().options({a: {type: 'bool', defaultValue: true}}), function(message) {
        assert.ok(message.indexOf('[ default: true ]') > 0) // travis 的终端只有 32 列，导致不在一行上，也就 assert error
      })
    })

    it('should output one entry when option have alias', function() {
      testHelp(Cli().options({'a | alpha': '<bool>'}), function(message) {
        assert.ok(message.indexOf('-a, --alpha') > 0, 'include a, alpha')
        var left = message.replace('-a, --alpha', '')
        assert.ok(left.indexOf('-a') < 0, 'not include a')
        assert.ok(left.indexOf('--alpha') < 0, 'not include alpha')
      })
    })

    it('should parse string defaultValue', function() {
      var opts = {
        a: '<bool> asf {{}}',
        b: '<bool> asf {{ab}}',
        c: '<bool> j 中文 \n kajsf {{false}}',
        d: '<str> default is string {{ "true" }}'
      }

      testOptions(opts, ['-c', '-d', 'ab'], {a: undefined, b: undefined, c: true, d: 'ab'})
      testOptions(opts, ['-a', '-c'], {a: true, b: undefined, c: true, d: 'true'})
      testOptions(opts, ['-a', '-b'], {a: true, b: true, c: false, d: 'true'})
    })

    it('should have userDefined prop', function() {
      Cli().options({a: '<bool> aa', b: '<str> bb'}).parse(['-c'], function(res) {
        assert.equal(res.userDefined.a, undefined)
        assert.equal(res.userDefined.b, undefined)
      })

      Cli().options({a: '<bool> aa', b: '<str> bb'}).parse(['-a'], function(res) {
        assert.equal(res.userDefined.a, true)
        assert.equal(res.userDefined.b, undefined)
      })

      Cli().options({a: '<bool> aa', b: '<str> bb'}).parse(['-b', 'b'], function(res) {
        assert.equal(res.userDefined.a, undefined)
        assert.equal(res.userDefined.b, true)
      })
    })
  })

  describe('env', function() {
    it('bool', function() {
      testEnv({a: '<bool>'}, {a: 'true'}, {a: true})
      testEnv({a: '<boolean>'}, {a: 'true'}, {a: true})
      testEnv({a: '<bool>'}, {a: '1'}, {a: true})
      testEnv({a: '<bool>'}, {a: 'false'}, {a: false})
      testEnv({a: '<bool>'}, {a: 'no'}, {a: false})
      testEnv({a: '<bool>'}, {a: '0'}, {a: false})
    })
    it('str', function() {
      testEnv({a: '<str>'}, {a: 'true'}, {a: 'true'})
      testEnv({a: '<string>'}, {a: 'yes'}, {a: 'yes'})
      testEnv({a: '<str>'}, {a: '1'}, {a: '1'})
      testEnv({a: '<str>'}, {a: 'false'}, {a: 'false'})
      testEnv({a: '<str>'}, {a: 'no'}, {a: 'no'})
      testEnv({a: '<str>'}, {a: '0'}, {a: '0'})
    })
    it('num', function() {
      testEnv({a: '<num>'}, {a: '1'}, {a: 1})
      testEnv({a: '<num>'}, {a: '100'}, {a: 100})
      testEnv({a: '<num>'}, {a: '0'}, {a: 0})
    })
    it('bstr', function() {
      testEnv({a: '<bstr>'}, {a: '1'}, {a: '1'})
      testEnv({a: '<bstr>'}, {a: 'true'}, {a: true})
      testEnv({a: '<bstr>'}, {a: 'false'}, {a: false})
      testEnv({a: '<bstr>'}, {a: '0'}, {a: '0'})
    })
    it('bnum', function() {
      testEnv({a: '<bnum>'}, {a: '1'}, {a: 1})
      testEnv({a: '<bnum>'}, {a: 'true'}, {a: true})
      testEnv({a: '<bnum>'}, {a: 'false'}, {a: false})
      testEnv({a: '<bnum>'}, {a: '0'}, {a: 0})
      testEnv({a: '<bnum>', b: '<bnumber>', c: '<bnum>'}, {a: '0', b: 'false'}, {a: 0, b: false})
    })
    it('count', function() {
      assert.throws(function() {
        process.env.a = '1'
        Cli().env({a: '<count>'}).parse(function() {})
        delete process.env.a
      }, /Not supported env type/)
    })
    it('arr', function() {
      assert.throws(function() {
        process.env.a = '1'
        Cli().env({a: '<arr>'}).parse(function() {})
        delete process.env.a
      }, /Not supported env type/)
    })
    it('duplicated', function() {
      assert.throws(function() {
        Cli().env({a: '<count>', 'b | a': '<str>'}).parse(function() {})
      }, /duplicated/)
    })
  })

  describe('equal option', function() {
    it('bool', function() {
      var opts = {
        b: '<bool>',
        bb: '<bool>',
        c: '<bool>',
        cc: '<bool>'
      }
      Cli().options(opts).parse(['-b=true', '--bb=true', '-c=no', '--cc=false'], function(res) {
        assert(res.b === true)
        assert(res.bb === true)
        assert(res.c === false)
        assert(res.cc === false)
      })
    })
    it('string', function() {
      var opts = {
        b: '<str>',
        bb: '<str>'
      }
      Cli().options(opts).parse(['-b=true', '--bb=abc'], function(res) {
        assert(res.b === 'true')
        assert(res.bb === 'abc')
      })
    })
    it('number', function() {
      var opts = {
        b: '<number>'
      }
      Cli().options(opts).parse(['-b=30'], function(res) {
        assert(res.b === 30)
      })
    })
    it('array', function() {
      var opts = {
        b: '<arr>'
      }
      Cli().options(opts).parse(['-b=30'], function(res) {
        assert(res.b[0] === '30')
      })
    })

    it('count', function() {
      testError({b: '<count>'}, ['-b=10'], /Error: "b" option do not need argument./)
    })

    it('multiple short arg', function() {
      var opts = {
        b: '<bool>',
        c: '<bool>'
      }
      Cli().options(opts).parse(['-bc=false'], function(res) {
        assert(res.b === true)
        assert(res.c === false)
      })
      Cli().options(opts).parse(['-bc=true'], function(res) {
        assert(res.b === true)
        assert(res.c === true)
      })
    })

    it('repeat assign', function() {
      testError({b: '<number>'}, ['-b30=false'], /Error: can not parse arg "-b30=false"/)
    })
  })

  describe('exception', function() {
    // it('throws when config needArgs less then 0', function() {
    //   Cli.__with__({'typeConfig.str.needArgs': -1})(function() {
    //     assert.throws(function() {
    //       Cli().options({s: '<str>'}).parse(['-s', 'aa'])
    //     }, /Parse error/)
    //   })
    // })

    it('throws when cmd is not a function', function() {
      assert.throws(function() {
        Cli().commands({ a: 1 })
      }, /Command "a" is invalid/)

      assert.throws(function() {
        Cli().commands({ a: {cmd: true} })
      }, /Command "a" should have a handle function/)
    })

    it('throws when cmd is duplicated', function() {
      var fn = sinon.spy()
      assert.throws(function() {
        Cli().commands({'a | aa': fn, aa: fn})
      }, /Command key "aa" is duplicated/)
    })

    it('throws when option value is not a valid string', function() {
      assert.throws(function() {
        Cli().options({a: '<boo xx'})
      }, /Option "a" config "<boo xx" is invalid/)
    })

    it('throws when option value is not a object or a string', function() {
      assert.throws(function() {
        Cli().options({a: true})
      }, /Option "a" is invalid/)
    })

    it('throws when option value is a object bug its type is illegal', function() {
      assert.throws(function() {
        Cli().options({a: {type: 'xx'}})
      }, /Option "a" type is invalid/)
    })

    it('throws when option is duplicated', function() {
      assert.throws(function() {
        Cli().options({'a | aa': '<bool>', aa: '<string>'})
      }, /Option key "aa" is duplicated/)
    })

    it('error when option type is number, but value is not number', function() {
      testError({a: '<number>'}, '-a aa', /Error: invalid number value/)
    })

    it('error when option need arguments but not got', function() {
      testError({a: '<string>', b: '<bool>'}, '-ba', /Error: str option -a need argument/)
      testError({a: '<string>', b: '<bool>'}, '-ab', /Error: str option -a need argument/)
      testError({aa: '<string>', b: '<bool>'}, '--aa', /Error: str option --aa need argument/)
    })
  })

  describe('others', function() {
    it('parse process.argv', function() {
      Cli.__with__({'process.argv': ['', '', 'a', 'b']})(function() {
        Cli().parse(function(res) {
          assert.deepEqual(res._, ['a', 'b'])
        })
      })
    })

    it('output nothing', function() {
      assert.equal(Cli().help(true).trim(), '\u001b[0m')
    })

    it('should consume --a as a value, not option a', function() {
      var cli = Cli().options({a: '<bool>'}).parse(['--a'])
      assert.deepEqual(cli._, ['--a'])
    })

    it('should stop parse after --', function() {
      var cli = Cli().options({c: '<count>'}).parse(['-c', '-c', '--', '-c'])
      assert.deepEqual(cli._, ['-c'])
      assert.equal(cli.res.c, 2)
    })
  })

  describe('config', function() {
    it('stopParseOnFirstNoOption enable', function() {
      var spy = sinon.spy(function(res) {
        assert.equal(res.a, true)
        assert.equal(res.c, undefined)
      })
      Cli({ stopParseOnFirstNoOption: true })
        .options({ a: '<bool>', c: '<bool>' })
        .parse(['-a', '-b', '-c'], spy)

      assert.ok(spy.calledOnce)
    })

    it('stopParseOnFirstNoOption disable (default)', function() {
      var spy = sinon.spy(function(res) {
        assert.equal(res.a, true)
        assert.equal(res.c, true)
      })
      Cli()
        .options({a: '<bool>', c: '<bool>'})
        .parse(['-a', '-b', '-c'], spy)

      assert.ok(spy.calledOnce)
    })

    it('showHelpOnError enable', function() {
      var cli = Cli({ showHelpOnError: true })
      var log = sinon.stub(console, 'log')
      var help = sinon.stub(cli, 'help').callsFake(function() {})

      cli.options({ a: '<string> ' }).parse(['-a'])

      assert.ok(help.calledOnce)
      log.restore()
      help.restore()
    })

    it('showHelpOnError disable (default)', function() {
      var cli = Cli()
      var log = sinon.stub(console, 'log')
      var help = sinon.stub(cli, 'help').callsFake(function() {})

      cli.options({ a: '<string> ' }).parse(['-a'])

      assert.ok(help.callCount === 0)
      log.restore()
      help.restore()
    })

    it('strict enable', function() {
      var cli = Cli({ strict: true })
      var error = sinon.stub(cli, 'error')
      cli.parse(['-s'])
      assert.equal(error.callCount, 1)
    })

    it('strict disable (default)', function() {
      var cli = Cli()
      var error = sinon.stub(cli, 'error')
      cli.parse(['-s'])
      assert.equal(error.callCount, 0)
    })

    it('in strict disabled: consume invalid option as value when', function() {
      var cli = Cli().parse(['-abcd'])
      assert.deepEqual(cli._, ['-abcd'])
    })

    it('usage', function() {
      testHelp(Cli({usage: 'are you'}), function(message) {
        assert.ok(message.indexOf('Usage:') > 0)
        assert.ok(message.indexOf('are you') > 0)
      })
    })

    it('usage function', function() {
      testHelp(Cli({usage: function() { return 'are you' }}), function(message) {
        assert.ok(message.indexOf('Usage:') > 0)
        assert.ok(message.indexOf('are you') > 0)
      })
    })

    it('desc', function() {
      testHelp(Cli({desc: 'foo bar'}), function(message) {
        assert.ok(message.indexOf('foo bar') > 0)
      })
      testHelp(Cli({desc: ['foo', 'bar']}), function(message) {
        assert.ok(message.indexOf('foo') > 0)
        assert.ok(message.indexOf('bar') > 0)
      })
    })

    it('desc function', function() {
      testHelp(Cli({desc: function() { return 'foo bar' }}), function(message) {
        assert.ok(message.indexOf('foo bar') > 0)
      })
    })

    it('example', function() {
      testHelp(Cli({example: 'foo bar'}), function(message) {
        assert.ok(message.indexOf('Example:') > 0)
        assert.ok(message.indexOf('foo bar') > 0)
      })
      testHelp(Cli({example: ['foo', 'bar']}), function(message) {
        assert.ok(message.indexOf('Example:') > 0)
        assert.ok(message.indexOf('foo') > 0)
        assert.ok(message.indexOf('bar') > 0)
      })
    })
    it('example function', function() {
      testHelp(Cli({example: function() { return 'foo bar' }}), function(message) {
        assert.ok(message.indexOf('Example:') > 0)
        assert.ok(message.indexOf('foo bar') > 0)
      })
    })

    it('epilog', function() {
      testHelp(Cli({epilog: 'are you'}), function(message) {
        assert.ok(message.indexOf('are you') > 0)
      })
    })
    it('epilog function', function() {
      testHelp(Cli({epilog: function() { return 'are you' }}), function(message) {
        assert.ok(message.indexOf('are you') > 0)
      })
    })

    it('help', function() {
      testHelp(Cli({help: 'foo bar'}), function(message) {
        assert.ok(message.indexOf('foo bar') > 0)
      })
      testHelp(Cli({}).env({aaa: '<str>'}), function(message) {
        assert.ok(message.indexOf('Env') > 0)
        assert.ok(message.indexOf('aaa') > 0)
      })
      Cli({help: false}).parse([], function(res) {
        assert.ok(!('help' in res))
        assert.ok(!('h' in res))
      })

      var handled = false
      Cli({help: false})
        .options({ 'h | help': '<str>' })
        .parse(['-h', '123'], function(res) {
          handled = true
          assert.ok(res.help === '123')
          assert.ok(res.h === '123')
        })
      assert.ok(handled)
    })

    it('version', function() {
      var spy = sinon.stub(console, 'log')
      Cli({version: '1.0.0'}).parse(['-v'])
      assert.ok(spy.calledOnce)
      assert.ok(spy.calledWith('1.0.0'))
      spy.reset()

      Cli().parse(['-v'])
      assert.ok(spy.calledOnce)
      assert.ok(spy.calledWith('0.0.0'))
      spy.restore()

      Cli({version: false}).parse([], function(res) {
        assert.ok(!('version' in res))
        assert.ok(!('v' in res))
      })

      var handled = false
      Cli({version: false})
        .options({ 'v | version': '<str>' })
        .parse(['-v', '123'], function(res) {
          handled = true
          assert.ok(res.version === '123')
          assert.ok(res.v === '123')
        })
      assert.ok(handled)
    })

    it('version function', function() {
      var spy = sinon.stub(console, 'log')
      Cli({version: function() { return '1.0.0' }}).parse(['-v'])
      assert.ok(spy.calledOnce)
      assert.ok(spy.calledWith('1.0.0'))
    })
  })
})

function testHelp(cli, test) {
  var help = cli.help
  var stub = sinon.stub(cli, 'help').callsFake(function() {
    var helpMessage = help.call(cli, true)
    test(helpMessage, cli)
  })
  cli.parse(['-h'])

  assert.equal(stub.callCount, 1)
  stub.restore()
}

function testOptions(opts, args, expect) {
  if (typeof args === 'string') args = args.split(/\s+/)

  var result
  var spy = sinon.spy(function(res) {
    result = res._
    for (var key in expect) {
      assert.deepEqual(expect[key], res[key],
        'expect "' + key + '" to be ' + JSON.stringify(expect[key])
        + ', but got ' + JSON.stringify(res[key]))
    }
  })
  Cli().options(assign({}, opts))
    .parse(args, spy)
  assert.equal(spy.callCount, 1)
  return result
}

function testEnv(envOpts, customEnv, expect) {
  var spy = sinon.spy(function(res) {
    for (var key in expect) {
      assert.deepEqual(expect[key], res.env[key],
        'expect "' + key + '" to be ' + JSON.stringify(expect[key])
        + ', but got ' + JSON.stringify(res.env[key]))
    }
  })

  Object.keys(customEnv).forEach(function(key) {
    process.env[key] = customEnv[key]
  })

  Cli().env(assign({}, envOpts)).parse([], spy)

  Object.keys(customEnv).forEach(function(key) {
    delete process.env[key]
  })
  assert.equal(spy.callCount, 1)
}

function testError(opts, args, re) {
  if (typeof args === 'string') args = args.split(/\s+/)
  var cli = Cli().options(assign({}, opts))
  var spy = sinon.stub(cli, 'error').callsFake(function(message) {
    assert.ok(re.test(message), 'expect ' + message + ' match ' + re.toString())
  })

  cli.parse(args)
  assert.equal(spy.callCount, 1)
}
