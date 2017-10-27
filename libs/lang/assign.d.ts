interface Interface {
  /**
   *
   * 原生的 Object.assign 的一个 polyfill
   *
   * Node v4 以前基本上都不支持 Object.assign 这个方法，此方法是 sindresorhus 写
   * 的 object-assign 的一个简化版，源版本还对原生的 Object.assign 做了 bug detect
   * ( Detect buggy property enumeration order in older V8 versions )，我这个
   * 版本相对简单点
   *
   * @param     {Object} target     要赋值到的对象
   * @param     {...Object} sources  源对象，可以有多个
   * @throws    {TypeError}         如果第一个参数是 null 或者 undefined
   * @return    {Object}
   *
   * @example
   * ```
   * assign({}, {a: '1', b: 2}, null, true, {a: 1})
   * ```
   *
   * @see       [object-assign@4.1.0]{@link https://github.com/sindresorhus/object-assign/tree/v4.1.0}
   * @author    Zhongle Qiu
   * @since     2.0.0
   */
  (target: any, ...sources: any[]): any
}

declare const instance: Interface
export = instance
