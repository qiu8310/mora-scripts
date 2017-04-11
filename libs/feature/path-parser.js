// https://github.com/pillarjs/path-to-regexp

/*
  /foo/bar
  /foo/:id
  /:foo/:bar
  /foo(/:id)
  /foo/:<int>id  => 强制转换成整数（默认将 id 或 以Id结尾的单词解析成整数）

  /(apple-)icon-:<int>res.png    '/icon-76.png'

  // * 表示必须的参数

  foo&bar
  foo*&bar=
  backendId*=:<int>frontId&bar
  <int>backendId*

  backendId*=:frontId
 */
