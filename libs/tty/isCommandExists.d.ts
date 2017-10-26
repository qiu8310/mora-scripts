interface Interface {
  /**
   * 判断某个命令是否存在，兼容 windows 和 unix 平台
   */
  (command: string): boolean
}

declare const instance: Interface
export = instance
