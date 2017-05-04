#!/usr/bin/env node

/**
 * 代码参考了 npm package: validate-commit-msg
 */

var fs = require('fs')
var path = require('path')
var util = require('util')

var findup = require('../libs/fs/findup')

// fixup! and squash! are part of Git, commits tagged with them are not intended to be merged, cf. https://git-scm.com/docs/git-commit
var PATTERN = /^((fixup! |squash! )?(\w+)(?:\(([^)\s]+)\))?: (.+))(?:\n|$)/
var MERGE_COMMIT_PATTERN = /^Merge .+/
var IGNORED_PATTERN = new RegExp(util.format('(^WIP)|(^%s$)', require('semver-regex')().source))

var isPackageFileExists = false
var config = {
  command: __filename,
  warnOnFail: false,
  showHelp: false,
  maxSubjectLength: 80,
  subjectPattern: '.+',
  types: ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert']
}

// istanbul ignore next
if (module.parent === null) {
  // spawn('git', ['rev-parse',  '--show-toplevel'], { stdio: ['ignore', 'pipe', 2] });
  var dir = findup.git()

  try {
    var pkg = require(findup.pkg())
    var pkgConfig = pkg.config && pkg.config.hooks && pkg.config.hooks['commit-msg']
    if (typeof pkgConfig === 'object') for (var k in pkgConfig) config[k] = pkgConfig[k]
    isPackageFileExists = true
  } catch (e) {}

  var commitMsgFile = process.argv[2] || path.join(dir, 'COMMIT_EDITMSG')
  var commitErrFile = commitMsgFile.replace('COMMIT_EDITMSG', 'ERROR_COMMIT_EDITMSG')

  var msg = fs.readFileSync(commitMsgFile).toString()

  if (validate(msg)) {
    process.exit(0)
  } else {
    outputHelp()
    fs.appendFileSync(commitErrFile, msg + '\n')
    process.exit(1)
  }
}

function validate(raw) {
  var messageWithBody = (raw || '').split(/\r?\n/).filter(function(str) {
    return str.indexOf('#') !== 0
  }).join('\n')

  var message = messageWithBody.split('\n').shift().trim()

  if (message === '') {
    console.log('Aborting commit due to empty commit message.')
    return false
  }

  var isValid = true

  if (MERGE_COMMIT_PATTERN.test(message)) {
    console.log('Merge commit detected.')
    return true
  }

  if (IGNORED_PATTERN.test(message)) {
    console.log('Commit message validation ignored.')
    return true
  }

  var match = PATTERN.exec(message)

  if (!match) {
    error('does not match "<type>(<scope>): <subject>" !')
    isValid = false
  } else {
    var firstLine = match[1]
    var squashing = !!match[2]
    var type = match[3]
    // var scope = match[4]
    var subject = match[5].trim()
    var firstLetter = subject[0]
    var lastLetter = subject[subject.length - 1]

    var SUBJECT_PATTERN = new RegExp(config.subjectPattern)

    if (firstLine.length > config.maxSubjectLength && !squashing) {
      error('is longer than %d characters !', config.maxSubjectLength)
      isValid = false
    }

    if (config.types !== '*' && config.types.indexOf(type) === -1) {
      error('"%s" is not allowed type !', type)
      isValid = false
    }

    if (!SUBJECT_PATTERN.exec(subject)) {
      error('subject does not match subject pattern !')
      isValid = false
    }

    if (firstLetter.toLowerCase() !== firstLetter) {
      error('don\'t capitalize first letter !')
      isValid = false
    }

    if (/[.,!;]/.test(lastLetter)) {
      error('no punctuation mark at the end !')
      isValid = false
    }
  }

  // Some more ideas, do want anything like this ?
  // - Validate the rest of the message (body, footer, BREAKING CHANGE annotations)
  // - allow only specific scopes (eg. fix(docs) should not be allowed ?
  // - auto correct the type to lower case ?
  // - auto correct first letter of the subject to lower case ?
  // - auto add empty line after subject ?
  // - auto remove empty () ?
  // - auto correct typos in type ?
  // - store incorrect messages, so that we can learn

  return isValid || config.warnOnFail
}

function outputHelp() {
  // istanbul ignore if
  if (!config.showHelp) return

  console.log('\x1b[90m\nCurrent commit-msg hook config:')
  console.log(JSON.stringify(formatObject(config), null, 4).replace(/^|\n/g, '\n    '))
  // istanbul ignore if
  if (isPackageFileExists) {
    console.log('\nYou can overwrite the config use `config.hooks.commit-msg` in package.json')
  }

  console.log('\n============================================================================\n')
  console.log(
    'Git Commit Message Guides: \n'
    + '  https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit\n'
    + '  http://chris.beams.io/posts/git-commit/'
  )
  console.log('\nChangelog keywrods: Added, Changed, Breaks, Deprecated, Removed, Fixed, Security')
  console.log('\nExample:\n')
  console.log(
    '  fix($compile): couple of unit tests for IE9\n'
    + '  \n'
    + '  Older IEs serialize html uppercased, but IE9 does not...\n'
    + '  Would be better to expect case insensitive, unfortunately jasmine does\n'
    + '  not allow to user regexps for throw expectations.\n'
    + '  \n'
    + '  Closes #392, #400\n'
    + '  Breaks foo.bar api, foo.baz should be used instead'
  )
  console.log('\x1b[0m')
}

function formatObject(obj) {
  obj = JSON.parse(JSON.stringify(obj))
  for (var key in obj) {
    // istanbul ignore if
    if (Array.isArray(obj[key])) obj[key] = '[ ' + obj[key].join(', ') + ' ]'
    // istanbul ignore next
    else if (typeof obj[key] === 'object') obj[key] = formatObject(obj[key])
  }
  return obj
}

function error() {
  // gitx does not display it
  // http://gitx.lighthouseapp.com/projects/17830/tickets/294-feature-display-hook-error-message-when-hook-fails
  // https://groups.google.com/group/gitx/browse_thread/thread/a03bcab60844b812
  console[config.warnOnFail ? 'warn' : 'error']('INVALID COMMIT MSG: ' + util.format.apply(null, arguments))
}

module.exports = validate
module.exports.help = outputHelp

