#!/usr/bin/env node

/**
 * Generated by mora-scripts. Do not edit this file.
 */

var dirname = require('path').dirname
var root = dirname(dirname(__dirname))
var cmd = __filename.replace(__dirname, '').substr(1)

try {
  if (!internalRequire()) {
    require('mora-scripts/hooks/scripts/runner')(root, cmd)
  }
} catch (e) {
  warnAboutGHooks()
}

// for internal use
function internalRequire() {
  try {
    if (require('../../package.json').name === 'mora-scripts') {
      require('../../hooks/scripts/runner')(root, cmd)
      return true
    }
  } catch (e) {}
}

function warnAboutGHooks() {
  console.warn(
    '\x1b[33m'
    + 'mora-scripts not found!\n'
    + 'Make sure you have it installed on your "node_modules".\n'
    + 'Skipping git hooks.\x1b[0m'
  )
}
