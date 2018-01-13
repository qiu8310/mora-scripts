var path = require('path')
var fs = require('fs')
var assert = require('assert')
var inject = require('../inject')

/* eslint-env mocha */
/* istanbul ignore next/if/else */
describe('libs/fs/inject', function() {
  it('inject to html', function() {
    injectAndExpect(
      'inject.html',
      {html1: 'aaa', html2: 'bbb'},
      '<!--# INJECT_START html1 #-->\naaa\n<!--# INJECT_END #-->\n\n<!--# INJECT_START {"key": "html2"} #-->\nbbb\n<!--# INJECT_END #-->\n'
    )
  })

  it('loose inject to html', function() {
    injectAndExpect(
      'inject.html',
      {html1: 'aaa', html2: 'bbb'},
      '<!--# INJECT_START html1 #-->\naaa\n<!--# INJECT_END #-->\n\n<!--# INJECT_START {"key": "html2"} #-->\nbbb\n<!--# INJECT_END #-->\n',
      {tags: 'loose'}
    )
  })

  it('return content', function() {
    var filepath = file('inject.html')
    var content = fs.readFileSync(filepath).toString()
    var newContent = inject(filepath, {html1: 'aaa', html2: 'bbb'}, {returnContent: true})
    assert.equal(newContent, '<!--# INJECT_START html1 #-->\naaa\n<!--# INJECT_END #-->\n\n<!--# INJECT_START {"key": "html2"} #-->\nbbb\n<!--# INJECT_END #-->\n')
    fs.writeFileSync(filepath, content)
  })

  it('inject custom string tags', function() {
    injectAndExpect(
      'inject.fakehash',
      {foo: 'abc'},
      '## INJECT_START foo ##\nabc\n## INJECT_END ##\n',
      {tags: 'hash'}
    )
  })

  it('inject custom array tags and keep the leading spaces', function() {
    injectAndExpect(
      'inject.array',
      {test: 'abc'},
      '  // INJECT_START {"type": "string", "key": "test"} //\n  abc\n  // INJECT_END //\n',
      {tags: ['// ', ' //', '// ', ' //']}
    )

    injectAndExpect(
      'inject.array',
      {test: 'abc'},
      '  // INJECT_START {"type": "string", "key": "test"} //\nabc\n  // INJECT_END //\n',
      {tags: ['// ', ' //', '// ', ' //'], autoPrefixSpaces: false}
    )
  })

  it('inject file', function() {
    injectAndExpect(
      'inject.js',
      {foo: file('tpl.tpl')},
      [
        '/*# INJECT_START {"type": "file", "key": "foo"} #*/',
        'the is template file\n',
        '/*# INJECT_END #*/\n'
      ].join('\n')
    )
  })

  it('should throws when type is not supported', function() {
    assert.throws(function() {
      inject(file('inject.notype'), {}, {tags: 'html'})
    }, /Not supported inject type/)
  })

  it('should throws when extension not support and tags not specified', function() {
    assert.throws(function() {
      inject(file('inject.notexists'), {})
    }, /Can not judge the tags from current file extension/)
  })

  it('should throws when tags was not string or 4 items array', function() {
    assert.throws(function() {
      inject(file('inject.html'), {}, {tags: {}})
    }, /Tags options should be Array and contains 4 string items/)

    assert.throws(function() {
      inject(file('inject.html'), {}, {tags: ['a', 'b']})
    }, /Tags options should be Array and contains 4 string items/)
  })

  it('should throws when json config is not valid', function() {
    assert.throws(function() {
      inject(file('inject.invalidjson'), {}, {tags: 'html'})
    }, /Inject config.* is not a valid json string/)
  })

  it('should throws when json config contains no key', function() {
    assert.throws(function() {
      inject(file('inject.nokey'), {}, {tags: 'html'})
    }, /Inject config.* should contains "key" field/)
  })

  it('should not update original file when nothing updated', function() {
    var f = file('inject.notupdate')
    var oldmtime = fs.statSync(f).mtime
    inject(f, {foo: 'xx'}, {tags: 'html'})
    assert.equal(fs.statSync(f).mtime.getTime(), oldmtime.getTime())
  })
})

function injectAndExpect(name, data, expect, options) {
  var filepath = file(name)
  var content = fs.readFileSync(filepath).toString()
  inject(filepath, data, options)
  var newContent = fs.readFileSync(filepath).toString()
  assert.equal(newContent, expect)
  fs.writeFileSync(filepath, content)
}

function file(name) {
  return path.join(__dirname, 'fixtures', 'inject', name)
}
