var fs = require('fs'),
  path = require('path');

function exists(filepath, types) {
  if (!types) types = 'File';

  try {
    var stats = fs.statSync(filepath);
    return [].concat(types).some(function (type) {
      return stats['is' + type] && stats['is' + type]();
    });
  } catch (e) {
    return false;
  }
}

function findup(dir, iteratorSync, options) {
  options = options || {};

  if (typeof iteratorSync === 'string') {
    var file = iteratorSync;
    iteratorSync = function(dir){
      return exists(path.join(dir, file), options.types || options.type);
    };
  }

  var initialDir = dir;
  var currentDepth = 0;
  while (dir !== path.join(dir, '..')) {
    if (typeof options.maxdepth === 'number' && options.maxdepth >= 0 && currentDepth > options.maxdepth) {
      break
    }
    currentDepth++;
    if (dir.indexOf('../../') !== -1) throw new Error(initialDir + ' is not correct.');
    if (iteratorSync(dir)) return dir;
    dir = path.join(dir, '..');
  }
  throw new Error('not found');
};

function _find(root, file, type) {
  if (file == null) {
    file = root;
    root = process.cwd();
  }
  var dir = findup(root, file, {type: type});
  return path.resolve(path.join(dir, file));
}

findup.file = function (root, file) {
  return _find(root, file, 'File');
}

findup.dir = function (root, dir) {
  return _find(root, dir, 'Directory');
}

findup.pkg = function (dir) {
  return findup.file(dir || process.cwd(), 'package.json')
}

findup.git = function (dir) {
  var dir = findup.dir(dir || process.cwd(), '.git');

  var stats = fs.statSync(dir);
  if (!stats.isDirectory()) { // .git 可能是一个文件，而不是文件夹
    return fs.readFileSync(gitFile, 'utf8').substring('gitdir: '.length).trim();
  }
  return dir;
}

module.exports = findup;
