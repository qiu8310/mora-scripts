/**
 *
 * @module      libs/fs/inject
 * @createdAt   2017-06-12
 *
 * @copyright   Copyright (c) 2017 Zhonglei Qiu
 * @license     Licensed under the MIT license.
 */
var fs = require('fs')
var escapeRegExp = require('../lang/escapeRegExp')
var EOL = '\n'

var TAGS_MAP = {
  hash: ['## ', ' ##', '## ', ' ##'],
  docs: ['/*# ', ' #*/', '/*# ', ' #*/'],
  html: ['<!--# ', ' #-->', '<!--# ', ' #-->'],
  loose: ['# ', ' #', '# ', ' #']   // 最宽松的模式
}
var TAGS_FILE_EXTENSIONS = {
  hash: ['gitignore', 'sh', 'bash', 'npmignore'],
  docs: ['js', 'jsx', 'css', 'sass', 'ts', 'tsx', 'json'],
  html: ['html', 'md']
}

var TAG_START_KEYWORD = 'INJECT_START'
var TAG_END_KEYWORD = 'INJECT_END'

/**
 * 根据文件 file 中的注释，注入 data 中对应的内容
 *
 * GROUP   |  EXTENSIONS                          |  TAGS
 * --------|--------------------------------------------------------------
 * hash    |  gitignore, sh, bash                 | ['## ', ' ##', '## ', ' ##']
 * docs    |  js, jsx, css, sass, ts, tsx, json   | (文档注释加 "#")
 * html    |  html, md                            | ['<!--# ', ' #-->', '<!--# ', ' #-->']
 * loose   |  支持上面所有的后缀                     | ['# ', ' #', '# ', ' #']
 *
 * @param  {string} file      要注入的文件的文件路径
 * @param  {Object} data      要注入的内容
 * @param  {Object} [options] 选项
 * @param  {string|Array<string>} [options.tags]     [tagStartLeft, tagStartRight, tagEndLeft, tagEndRight]
 * @param  {boolean} [options.autoPrefixSpaces = true]  自动根据最后一个注释前的空格给每一行都添加相同的空格
 * @param  {boolean} [options.returnContent = false]  返回注入的内容，而不是直接注入
 * @param  {boolean} [options.append = false]  是否将内容 append 到原区块之后，而不是整体替换
 * @example
 * bash 中可以这样写： (type 默认是 string，可以不写，另外支持 file，这时 key 对应的 value 是文件地址)
 *
 *  ## INJECT_START {"type": "string", "key": "ignores"} ##
 *  ## INJECT_END ##
 *
 * 或
 *
 *  ## INJECT_START ignores ##
 *  ## INJECT_END ##
 *
 * @return {number}         返回注入成功的数量
 */
module.exports = function inject(file, data, options) {
  options = options || {}
  if (!('autoPrefixSpaces' in options)) options.autoPrefixSpaces = true
  var content = fs.readFileSync(file).toString()
  var counter = {count: 0}

  var tags = getTags(file, options)
  var regexp = buildRegExp(tags, TAG_START_KEYWORD, TAG_END_KEYWORD)
  var newContent = content.replace(regexp, replaceContent(data, counter, options))

  if (options.returnContent) return newContent
  if (newContent !== content) fs.writeFileSync(file, newContent)

  return counter.count
}

function getTags(file, options) {
  var tagsKey = options.tags
  var tags = tagsKey
  if (!tagsKey) {
    var extension = file.split('.').pop()
    tagsKey = Object.keys(TAGS_FILE_EXTENSIONS).find(function(key) {
      return TAGS_FILE_EXTENSIONS[key].indexOf(extension) >= 0
    })

    // if (!tagsKey) throw new Error('Can not judge the tags from current file extension')
    if (!tagsKey) tagsKey = 'loose' // 无法判断出就使用 loose 模式
  }

  if (typeof tagsKey === 'string') tags = TAGS_MAP[tagsKey]
  if (!Array.isArray(tags) || tags.length !== 4) throw new Error('Tags options should be Array and contains 4 string items')

  return tags
}

function replaceContent(data, counter, options) {
  return function(raw, startLine, jsonString, oldValue, endLine, spaces) {
    var json = checkJsonString(jsonString)
    var type = json.type || 'string'
    var dataValue = data[json.key] || ''

    if (typeof dataValue === 'function') {
      dataValue = dataValue(oldValue)
    }

    var replaceValue
    switch (type) {
      case 'string':
        replaceValue = dataValue
        break
      case 'file':
        replaceValue = fs.readFileSync(dataValue).toString()
        break
      default:
        throw new Error('Not supported inject type<' + data.type + '>')
    }

    counter.count++
    var eol = options.eol == null ? EOL : options.eol
    return startLine.trim()
      + (options.append ? oldValue : eol)
      + prefixSpaces(replaceValue, spaces, options.autoPrefixSpaces) + (replaceValue && eol)
      + endLine
  }
}

function prefixSpaces(content, spaces, enabled) {
  if (!content || !enabled) return content
  return spaces + content.replace(/\r?\n/g, '$&' + spaces)
}

function checkJsonString(raw) {
  var json
  var str = raw.trim()
  try {
    json = str[0] === '{' ? JSON.parse(str) : {key: str}
  } catch (e) {
    throw new Error('Inject config<' + raw + '> is not a valid json string')
  }

  if (!json.hasOwnProperty('key')) throw new Error('Inject config<' + raw + '> should contains "key" field')

  return json
}

function buildRegExp(tags, startKeyword, endKeyword) {
  return new RegExp(
    '(\\S*' + escapeRegExp(tags[0] + startKeyword) + '\\s*(.*)\\s*' + escapeRegExp(tags[1]) + '\\S*)'
    + '([\\s\\S]*?)'
    // 保持前导的空格或 tab 一样多
    + '(([   ]*)\\S*' + escapeRegExp(tags[2] + endKeyword + tags[3]) + '\\S*)',
    'g'
  )
}
