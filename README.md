# mora-scripts

[![Greenkeeper badge](https://badges.greenkeeper.io/qiu8310/mora-scripts.svg)](https://greenkeeper.io/)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Build Status](https://img.shields.io/travis/qiu8310/mora-scripts/master.svg)](https://travis-ci.org/qiu8310/mora-scripts)
[![Build status](https://ci.appveyor.com/api/projects/status/90txwxbg4mo3hlc1/branch/master?svg=true)](https://ci.appveyor.com/project/qiu8310/mora-scripts/branch/master)
[![Coverage Status](https://img.shields.io/codecov/c/github/qiu8310/mora-scripts/master.svg)](https://codecov.io/gh/qiu8310/mora-scripts)

## TODO

* 生成单独的 package，以 ms- 开头，如 ms-fs-exists
* 统一 new Error 中的字符串参数首字母要大写，且最后不要带标点符号


## cli

### run

以 `pkg.` 开头的变量会递归的循环解析成对应的 package.json 中的值

在 `run` 后面使用 `--prefix=xxx` 可以修改默认的 `pkg` 前缀

```json
//...
"scripts": {
  "build": "run NODE_ENV=development webpack -p",
  "release": "run --prefix % git commit -am 'release %.version' && run git tag %.version"
}
//...
```

主要参考了下面这些组件的功能

- [better-npm-run](https://github.com/benoror/better-npm-run)
- [cross-env](https://github.com/kentcdodds/cross-env)
- [argv-set-env](https://github.com/kentcdodds/argv-set-env)
- [with-package](https://github.com/bahmutov/with-package)

### puts

用于在命令行上输出颜色，如

```bash
# "Are you ok" will output in red color
puts '%cAre you ok' 'red'   
```

更多详情参考文件 [libs/color.js](libs/color.js)

#### 另外还要三个用于输出颜色的命令没有放在 cli 目录下，也没放到 package.json 中的 bin 中，
主要是因为在命令行上使用只是它们的次要功能

* [libs/info.js](libs/info.js) 输出的文字是 cyan 的颜色
* [libs/warn.js](libs/warn.js) 输出的文字是 yellow 的颜色
* [libs/error.js](libs/error.js) 输出的文件是 red 的颜色

## hooks

* post-merge 可以在每次从远端拉取代码时自动根据 package.json 文件是否有更新而执行 `npm install`
* commit-msg 检查提交的信息是否符合规范，规范：`<type>(<scope>): <subject>`
* pre-push   提交前检查脚本中是否有 lint 和 test 命令，有的话便执行它

主要参考了下面这些组件的功能

- [`ghooks`](https://github.com/gtramontina/ghooks) _已经废弃，请使用 husky_
- [`husky`](https://github.com/typicode/husky)
- [`validate-commit-msg`](https://github.com/kentcdodds/validate-commit-msg)


#### install

```
npm install mora-scripts --save-dev
```

#### config

package.json

```json
...
"config": {
  "hooks": {
    "post-merge": "node ~/mora-scripts/hooks/post-merge.js"
  }
}
...
```

or

```json
"config": {
  "hooks": {
    "commit-msg": true,
    "post-merge": true
  }
}
```

or

```json
"config": {
  "hooks": {
    "commit-msg": {
      "command": "node ~/mora-scripts/hooks/commit-msg.js",
      "warnOnFail": false,
      "showHelp": true,
      "maxSubjectLength": 100,
      "subjectPattern": ".+",
      "types": ["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore", "revert"]
    }
  }
}
```


## js

### promise-extra

Add `Promise.prototype.finally` and `Promise.try` functions.


