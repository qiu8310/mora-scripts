#!/usr/bin/env node

/**
 * 代码参考了 npm package: validate-commit-msg
 */

var fs = require('fs');
var path = require('path');
var util = require('util');
var spawn = require('cross-spawn');

// fixup! and squash! are part of Git, commits tagged with them are not intended to be merged, cf. https://git-scm.com/docs/git-commit
var PATTERN = /^((fixup! |squash! )?(\w+)(?:\(([^\)\s]+)\))?: (.+))(?:\n|$)/;
var MERGE_COMMIT_PATTERN = /^Merge /;
var IGNORED_PATTERN = new RegExp(util.format('(^WIP)|(^%s$)', require('semver-regex')().source));

var isPackageFileExists = false;
var config = {
  file: __filename,
  warnOnFail: false,
  showHelp: true,
  maxSubjectLength: 100,
  subjectPattern: '.+',
  types: ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert']
};

// istanbul ignore next
if (module.parent === null) {
  var rev = spawn('git', ['rev-parse',  '--show-toplevel'], { stdio: ['ignore', 'pipe', 2] });
  rev.stdout.on('data', function (dir) {
    dir = dir.toString().trim();

    // 读取 package.json 文件（如果有的话），修改默认配置
    try {
      var pkg = require(path.join(dir, 'package.json'));
      var pkgConfig = pkg.config && pkg.config.hooks && pkg.config.hooks['commit-msg'];
      if (typeof pkgConfig === 'object') Object.assign(config, pkgConfig);
      isPackageFileExists = true;
    } catch (e) {}

    var commitMsgFile = process.argv[2] || path.join(dir, '.git', 'COMMIT_EDITMSG');
    var commitErrFile = commitMsgFile.replace('COMMIT_EDITMSG', 'ERROR_COMMIT_EDITMSG');

    var msg = fs.readFileSync(commitMsgFile).toString();
    if (validate(msg)) {
      process.exit(0);
    } else {
      outputHelp();
      fs.appendFileSync(commitErrFile, msg + '\n');
      process.exit(1);
    }
  });
}

function validate(raw) {
  var messageWithBody = (raw || '').split('\n').filter(function (str) {
    return str.indexOf('#') !== 0;
  }).join('\n');

  var message = messageWithBody.split('\n').shift();

  if (message === '') {
    console.log('Aborting commit due to empty commit message.');
    return false;
  }

  var isValid = true;

  if(MERGE_COMMIT_PATTERN.test(message)){
    console.log('Merge commit detected.');
    return true
  }

  if (IGNORED_PATTERN.test(message)) {
    console.log('Commit message validation ignored.');
    return true;
  }

  var match = PATTERN.exec(message);

  if (!match) {
    error('does not match "<type>(<scope>): <subject>" !');
    isValid = false;
  } else {
    var firstLine = match[1];
    var squashing = !!match[2];
    var type = match[3];
    var scope = match[4];
    var subject = match[5];

    var SUBJECT_PATTERN = new RegExp(config.subjectPattern);

    if (firstLine.length > config.maxSubjectLength && !squashing) {
      error('is longer than %d characters !', MAX_LENGTH);
      isValid = false;
    }

    if (config.types !== '*' && config.types.indexOf(type) === -1) {
      error('"%s" is not allowed type !', type);
      isValid = false;
    }

    if (!SUBJECT_PATTERN.exec(subject)) {
      error('subject does not match subject pattern!');
      isValid = false;
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

  return isValid || config.warnOnFail;
}

function outputHelp() {
  if (!config.showHelp) return ;

  console.log('\nCurrent commit-msg hook config:');
  console.log(JSON.stringify(config, null, 4).replace(/^|\n/g, '\n    '));
  if (isPackageFileExists) {
    console.log('\nYou can overwrite the config use `config.hooks.commit-msg` in package.json');
  }
}

function error() {
  // gitx does not display it
  // http://gitx.lighthouseapp.com/projects/17830/tickets/294-feature-display-hook-error-message-when-hook-fails
  // https://groups.google.com/group/gitx/browse_thread/thread/a03bcab60844b812
  console[config.warnOnFail ? 'warn' : 'error']('INVALID COMMIT MSG: ' + util.format.apply(null, arguments));
}

module.exports = validate;



