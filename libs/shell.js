// 参考 npm package: spawn-command@0.0.2  execa@0.4.0

var util = require('util');
var spawn = require('child_process').spawn;

module.exports = function (command, options) {
  options = options || {};

  var file, args;
  if (process.platform === 'win32') {
    file = 'cmd.exe';
    args = ['/s', '/c', '"' + command + '"'];
    options.windowsVerbatimArguments = true;
  } else {
    file = '/bin/sh';
    args = ['-c', command];
  }

  return spawn(file, args, options);
}
