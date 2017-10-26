interface Interface {
  /**
   * 递归遍历删除指定的文件或文件夹
   * @param  {String} file 要删除的文件的路径
   */
  (fileOrDirectory: string): void
}

declare const instance: Interface
export = instance
