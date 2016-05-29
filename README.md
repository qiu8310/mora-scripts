# mora-scripts


## hooks

Use hooks with [`ghooks`](https://github.com/gtramontina/ghooks)


### post-merge

#### install
```
npm install ghooks mora-scripts --save-dev
```

#### config

package.json

```json
...
"config": {
  "ghooks": {
    "post-merge": "node ./node_modules/mora-scripts/hooks/post-merge.js"
  }
}
...
```

## js

### promise-extra

Add `Promise.prototype.finally` and `Promise.try` functions.

