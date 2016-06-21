# mora-scripts


## hooks

* post-merge 可以在每次从远端拉取代码时自动根据 package.json 文件是否有更新而执行 `npm install`
* commit-msg 检查提交的信息是否符合规范，规范：`<type>(<scope>): <subject>`


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
    "commit-msg": {
      "command": "node ~/mora-scripts/hooks/commit-msg.js",
      "warnOnFail": false,
      "showHelp": true,
      "maxSubjectLength": 100,
      "subjectPattern": '.+',
      "types": ["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore", "revert"]
    }
  }
}
```

## js

### promise-extra

Add `Promise.prototype.finally` and `Promise.try` functions.


## Reference

* [`ghooks`](https://github.com/gtramontina/ghooks)
* [`validate-commit-msg`](https://github.com/kentcdodds/validate-commit-msg)
