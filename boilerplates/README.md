
## 记录思路

参考 [plop](https://github.com/amwmedia/plop) 的实现

**[webpack 配置 dll，加快打包速度](https://segmentfault.com/a/1190000006087638)**


* 模板只记录不太会变的部分，其它配置部分到时候写一个脚本自动生成
  比如 package.json 文件中：
  - name, version, keywords 等这些字段就是配置部分
  - 而 dependencies, devDependencies 等可以自动生成部分依赖

* 使用 json 文件支持注释，到时生成的时候去掉注释
* node 都使用 6.0.0 以上的版本

* 如果是开源项目，使用 greenkeeper 和 [snyk](https://snyk.io/)
* 生成后的文件都要去掉 `/*$ removeLine` 这行
