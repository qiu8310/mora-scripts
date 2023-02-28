interface Interface {
  /**
   * 判断当前终端是否支持显示颜色
   *
   * @param {NodeJS.WriteStream} stream
   */
  (stream: any): boolean
}

declare const instance: Interface
export = instance
