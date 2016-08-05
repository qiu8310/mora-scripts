require = require('./require')

const inquirer = require('inquirer')
const fs = require('fs-extra')
const path = require('path')
const async = require('async')
const isbinaryfile = require('isbinaryfile')
const exists = require('mora-scripts/libs/fs/exists')

function copyDir (fromDir, toDir) {
  fs.ensureDir(toDir)
  return fs.readdirSync(fromDir)
    .filter(f => !f.startsWith('_') && f !== 'node_modules')
    .reduce((result, name) => {
      let fromFile = path.resolve(fromDir, name)
      let toFile = path.resolve(toDir, name)
      let stat = fs.statSync(fromFile)

      if (stat.isFile()) {
        result.push({ fromFile, toFile })
      } else if (stat.isDirectory()) {
        result.push(...copyDir(fromFile, toFile))
      }
      return result
    }, [])
}

function copyFile (fromFile, toFile, answers) {
  let basename = path.basename(fromFile)
  if (isbinaryfile.sync(fromFile)) {
    fs.copySync(fromFile, toFile)
  } else if (basename === 'package.json') {
    copyPackageFile(fromFile, toFile, answers)
  } else if (basename.startsWith('webpack.config') && basename.endsWith('.js')) {
    copyWebpackConfigFile(fromFile, toFile, answers)
  } else {
    let content = fs.readFileSync(fromFile).toString()
  }
}

function copyPackageFile (fromFile, toFile, answers) {
  // 不破坏 package.json 文件
  // 可以直接在模板内测试利用 package.json 文件测试
  let pkg = require(fromFile)
  if (exists(toFile)) {
    let oldPkg = require(toFile)
    Object.keys(oldPkg).forEach(k => {
      if (pkg[k] == null || pkg[k] === '' ) {
        pkg[k] = oldPkg[k]
      } else if (Array.isArray(oldPkg[k])) {
        pkg[k] = oldPkg[k].concat(Array.isArray(pkg[k]) ? pkg[k] : [])
      } else if (typeof oldPkg[k] === 'object') {
        pkg[k] = Object.assign({}, oldPkg[k], pkg[k])
      }
    })
  }
  pkg.name = answers.name
  pkg.version = answers.version
  pkg.license = answers.license
  pkg.private = answers.private
  pkg.description = answers.description
  if (answers.bin && !pkg.bin) {
    pkg.bin = {}
  }
  if (answers.preferGlobal) {
    pkg.preferGlobal = true
  }
  if (answers.keywords) {
    pkg.keywords = (pkg.keywords || []).concat(answers.keywords)
  }
  console.log(pkg)
  // fs.writeFileSync(toFile, JSON.stringify(pkg, null, 2))
}

function copyWebpackConfigFile (fromFile, toFile, answers) {

}

exports.copy = function (fromDir, toDir, answers, done) {
  let alwaysOverwrite = false
  let alwaysIgnore = false

  async.eachSeries(
    copyDir(fromDir, toDir),

    ({ fromFile, toFile }, cb) => {
      if (!alwaysOverwrite && exists(toFile)) {
        if (alwaysIgnore) return cb()
        inquirer
          .prompt([{
            type: 'list',
            name: 'op',
            message () {
              return `file ${path.basename(toFile)} already exists`
            },
            choices: [
              'overwrite',
              'always overwrite',
              'ignore',
              'always ignore'
            ]
          }])
          .then(({ op }) => {
            switch (op) {
              case 'always ignore': alwaysIgnore = true
              case 'ignore': break
              case 'always overwrite': alwaysOverwrite = true
              case 'overwrite':
                copyFile(fromFile, toFile, answers)
                break
            }
            cb()
          })
          .catch(cb)
      } else {
        copyFile(fromFile, toFile, answers)
        cb()
      }
    },

    done
  )
}

exports.copy(
  '/Users/Mora/Workspace/node/mora-scripts/boilerplates/es5__react__router',
  '/Users/Mora/Workspace/node/mora-scripts/boilerplates',
  {
    name: 'xxoott',
    private: false,
    description: 'haha',
    version: '0.0.0',
    keywords: ['xx', 'oo'],
    bin: true,
    preferGlobal: false
  }
)
