interface Interface {
  /**
   * 创建目录
   *
   * 如果上级目录不存在，也会创建，类似于 Linux 的 mkdirp
   * @param   {String}        p        要创建的目录
   * @param   {Object|Number} opts      配置或者直接指定要创建的目录的
   *    -  {Number}        opts.mode
   *    -  {Object}        opts.fs
   * @return  {String}
   */
  (createDirectory: string, modeOrOptions?: number | {mode?: number, fs?: any}): string
}

declare const instance: Interface
export = instance
