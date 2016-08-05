require = require('./require')
const path = require('path')
const warn = require('mora-scripts/libs/sys/warn')

const DEFAULT_PKG_NAME = path.basename(process.cwd())

module.exports = function (opts) {
  // @TODO add github, use `github` package
  return [
    {
      type: 'input',
      name: 'name',
      message: 'package name',
      default: DEFAULT_PKG_NAME,
      validate (pkgName) {
        if (opts.skipValidatePkgName) return true
        pkgName = pkgName || DEFAULT_PKG_NAME

        // 不做成异步的形式，主要是异步的话，如果 package 重复，
        // 需要报错，inquirer 会直接中断程序
        if (require('all-the-package-names').indexOf(pkgName) > 0) {
          warn(`\n  warn: package name <${pkgName}> already exists, please try another one`)
          return false
        }
        return true
      }
    },
    {
      type: 'confirm',
      name: 'private',
      message: 'is private',
      default: false
    },
    {
      type: 'input',
      name: 'description',
      message: 'package description'
    },
    {
      type: 'input',
      name: 'version',
      message: 'package version',
      default: '0.0.0'
    },
    {
      type: 'input',
      name: 'license',
      message: 'package license',
      default: 'MIT'
    },
    {
      type: 'input',
      name: 'keywords',
      message: 'keywords separated by comma ( , )',
      filter (val) {
        val = val.trim()
        return val ? val.split(/\s*,\s*/) : []
      }
    },
    {
      type: 'confirm',
      name: 'bin',
      message: 'contains bin files',
      default: false
    },
    {
      type: 'confirm',
      name: 'preferGlobal',
      message: 'prefer installed in global',
      default: false,
      when (answers) {
        return answers.bin
      }
    }
  ]
}
