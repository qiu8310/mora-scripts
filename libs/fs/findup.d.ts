import {IFileType} from './_base'

interface Interface {
  /**
   *
   * 递归向上查找满足条件的文件夹
   *
   * @param  {String}           rootDir          起始查找目录
   * @param  {String|Function}  fileOrFileFoundFn 要查找到文件名，或者返回 Boolean 值的函数，
   *                                         如果此参数是函数，那么它会接收到参数是当前递归所在的目录
   * @param  {Object}           [options]    配置选项
   *
   *   - allowTypes:  {String|Array<String>} 要查找的文件所属类型， 参考 {@link module:libs/fs/exists} 函数的第二个参数
   *   - maxdepth:    {Number}               递归的深度，1：表示只会查找当前文件夹下的文件，2：表示查找当前文件夹和上一个文件夹 ...
   *
   * @throws {Error}            如果没有找到任何满足条件的文件夹
   * @return {String}           查找到的满足条件的文件夹路径
   *
   * @author    Zhongle Qiu
   * @since     2.0.0
   *
   */
  (rootDir: string, fileOrFileFoundFn: string | ((directory: string) => boolean), options?: {allowTypes?: IFileType | IFileType[], maxdepth?: number}): string
  /**
   * 递归向上查找指定的文件夹
   *
   * @param  {String} [rootDir]  起始查找目录（如果没有指定，则从当前路径开始）
   * @param  {String} needFindDirectoryName     要查找的文件夹名
   * @throws {Error}          如果没有找到满足条件的文件夹
   * @return {String}         返回查到的文件夹路径
   *
   * @author    Zhongle Qiu
   * @since     1.5.0
   */
  dir(rootDir: string, needFindDirectoryName: string): string
  dir(needFindDirectoryName: string): string
  /**
   * 递归向上查找指定的文件
   *
   * @param  {String} [rootDir]  起始查找目录（如果没有指定，则从当前路径开始）
   * @param  {String} needFindFileName    要查找的文件名
   * @throws {Error}          如果没有找到满足条件的文件
   * @return {String}         返回查到的文件路径
   *
   * @author    Zhongle Qiu
   * @since     1.5.0
   */
  file(rootDir: string, needFindFileName: string): string
  file(needFindFileName: string): string

  /**
   * 递归向上查找 package.json 文件
   *
   * @param  {String} [rootDir]  起始查找目录（如果没有指定，则从当前路径开始）
   * @throws {Error}          如果没有找到 package.json 文件
   * @return {String}         返回查到的 package.json 的路径
   *
   * @author    Zhongle Qiu
   * @since     1.5.0
   */
  pkg(rootDir?: string): string

  /**
   * 递归向上查找 .git 文件夹
   *
   * @param  {String} [rootDir]  起始查找目录（如果没有指定，则从当前路径开始）
   * @throws {Error}          如果没有找到 .git 文件夹
   * @return {String}         返回查到的 .git 文件夹的路径
   *
   * @author    Zhongle Qiu
   * @since     1.5.0
   */
  git(rootDir?: string): string
}

declare const instance: Interface
export = instance
