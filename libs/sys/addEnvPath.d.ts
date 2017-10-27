interface Interface {
  /**
   * 添加指定的路径到 PATH 环境变量中
   *
   * 新添加的路径都会放在最前面，方便系统最先解析它
   *
   * @param  {Object}               env     process.env 对象
   * @param  {Array<String>|String} paths   要添加的路径
   * @return {Object}               传入的 env 对象
   *
   * @example
   * ```
   * var env = addEnvPath(process.env, ['/you/path/need/to/add'])
   * console.log(env === process.env) // true: 意味着返回的是修改过的原对象，而不是一个新对象
   * ```
   *
   * @see [manage-path@2.0.0]{@link https://github.com/kentcdodds/node-manage-path/tree/v2.0.0}
   * @author Zhonglei Qiu
   * @since 2.0.0
   */
  (env: {[key: string]: any}, paths: string[]): {[key: string]: any}
}

declare const instance: Interface
export = instance
