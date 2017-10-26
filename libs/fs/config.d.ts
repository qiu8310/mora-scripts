interface Interface {
  /**
   * 获取指定名称的的配置文件
   *
   * 会查找当前文件目录、项目目录、用户 HOME 目录，通过 require 来引入文件（所以可以不用后缀）
   *
   * @param  {string} name   - 配置文件名称（可以不带后缀）
   * @param  {Object} options
   *                - {boolean} options.merge   - 是否 merge 找到的所有配置文件（默认只返回最先找到的）
   *                - {boolean} options.nocache   - 禁用 require 的 cache，即可以保证每次都重新 require
   * @return {any}
   */
  (nameKey: string, options?: {merge?: boolean, nocache?: boolean}): any
}

declare const instance: Interface
export = instance
