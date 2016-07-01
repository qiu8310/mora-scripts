var assert = require('assert')
var DotProp = require('../DotProp')


describe('DotProp', function () {

  describe('static method', function () {
    var obj

    beforeEach(function () {
      obj = {a: [1, '2', 3], o: {o1: '1', o2: 2}, 'd.ot': '.', n: null, u: undefined}
    })

    context('.has', function () {
      it('should has', function () {
        assert.equal(DotProp.has(obj, 'a'), true, 'base')
        assert.equal(DotProp.has(obj, 'o.o1'), true, 'object')
        assert.equal(DotProp.has(obj, 'n'), true, 'null')
        assert.equal(DotProp.has(obj, 'u'), true, 'undefined')
        assert.equal(DotProp.has(obj, 'd\\.ot'), true, 'include dot')
      })

      it('should not has', function () {
        assert.equal(DotProp.has(obj, 'b'), false, 'base')
        assert.equal(DotProp.has(obj, 'o.o3'), false, 'object')
        assert.equal(DotProp.has(obj, 'o.o3.oo'), false, 'deep object')
        assert.equal(DotProp.has(obj, 'n.n'), false, 'null')
        assert.equal(DotProp.has(obj, 'u.u'), false, 'undefined')
      })

      it('should not has when obj is not object or path is not string', function () {
        assert.equal(DotProp.has(null, 'b'), false)
        assert.equal(DotProp.has(obj, false), false)
        assert.equal(DotProp.has('111', false), false)
      })
    })

    context('.get', function () {
      it('should get', function () {
        assert.equal(DotProp.get(obj, 'a'), obj.a, 'base')
        assert.equal(DotProp.get(obj, 'o.o1'), '1', 'object')
        assert.equal(DotProp.get(obj, 'n'), null, 'null')
        assert.equal(DotProp.get(obj, 'u'), undefined, 'undefined')
        assert.equal(DotProp.get(obj, 'd\\.ot'), '.', 'include dot')
      })

      it('should not get', function () {
        assert.equal(DotProp.get(obj, 'b'), undefined, 'base')
        assert.equal(DotProp.get(obj, 'o.o3'), undefined, 'object')
        assert.equal(DotProp.get(obj, 'o.o3.oo'), undefined, 'deep object')
        assert.equal(DotProp.get(obj, 'n.n'), undefined, 'null')
        assert.equal(DotProp.get(obj, 'u.u'), undefined, 'undefined')
      })

      it('should get itself if obj is not object or path is not string', function () {
        assert.equal(DotProp.get(null, 'b'), null)
        assert.equal(DotProp.get(obj, false), obj)
        assert.equal(DotProp.get('111', false), '111')
      })
    })

    context('.set', function () {
      it('should set single key on object', function () {
        DotProp.set(obj, 'c', 'c')
        assert.equal(obj.c, 'c')
      })

      it('should set serial keys on object', function () {
        DotProp.set(obj, 'b.b1.b2', '3')
        assert.deepEqual(obj.b, {b1: {b2: 3}})
      })

      it('should set serial keys on exists target', function () {
        DotProp.set(obj, 'o.o1.o\\.o', 'dot')
        assert.equal(obj.o.o1['o.o'], 'dot')
      })

      it('should set on null key', function () {
        DotProp.set(obj, 'n.n', 'n')
        assert.deepEqual(obj.n, {n: 'n'})
      })

      it('should return true when set successed', function () {
        assert.equal(DotProp.set(obj, 'xx', 'xx'), true)
      })

      it('should return false when set failed', function () {
        assert.equal(DotProp.set(null, 'b'), false)
        assert.equal(DotProp.set(obj, null), false)
        assert.equal(DotProp.set(null, null), false)
      })
    })

    context('.del', function () {
      it('should return true when deleted', function () {
        assert.equal(DotProp.del(obj, 'o.o1'), true)
        assert.equal(DotProp.has(obj, 'o.o1'), false)
      })

      it('should return false when not deleted', function () {
        assert.equal(DotProp.del(obj, 'a.a1.a2'), false)
        assert.ok(DotProp.has(obj, 'a'))

        assert.equal(DotProp.del(obj, 'n.x'), false)
        assert.ok(DotProp.has(obj, 'n'))

        assert.equal(DotProp.del(obj, 'u.x'), false)
        assert.ok(DotProp.has(obj, 'u'))
      })

      it('should delete dot key', function () {
        assert.ok(DotProp.del(obj, 'd\\.ot'))
        assert.equal(DotProp.has(obj, 'd\\.ot'), false)
      })

      it('should not delete if obj is not object or path is not string', function () {
        assert.equal(DotProp.del(null, 'b'), false)
        assert.equal(DotProp.del(obj, null), false)
        assert.equal(DotProp.del(null, null), false)
      })
    })
  })

  describe('instance method', function () {
    var d1 = new DotProp({a: 'a'})
    var d2 = DotProp(null)

    it('#has', function () {
      assert.equal(d1.has('a'), true)
      assert.equal(d1.has('a.a'), false)
    })
    it('#get', function () {
      assert.equal(d1.get('a'), 'a')
      assert.equal(d1.get('x'), undefined)
    })
    it('#set', function () {
      assert.equal(d2.set('x', 'x'), true)
      assert.equal(d2.get('x'), 'x')
    })
    it('#del', function () {
      assert.equal(d1.del('a'), true)
      assert.equal(d1.get('a'), undefined)
    })
  })
})
