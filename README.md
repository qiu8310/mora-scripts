# mora-scripts


## hooks

Use hooks with [`ghooks`](https://github.com/gtramontina/ghooks)


### install
```
npm install ghooks mora-scripts --save-dev
```

### config

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
