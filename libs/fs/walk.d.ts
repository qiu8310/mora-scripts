import fs from 'fs'

interface Interface {
  (
    /**
     * 要遍历的根目录
     */
    rootDir: string,
    /**
     * 所有遍历过的文件或文件夹的回调
     *
     * 回调函数，如果返回 false，则不会继续
     */
    callback: (fileDir: string, fileName: string, fileFullPath: string, fileStat: fs.Stats) => boolean | void | undefined
  ): void
}

declare const instance: Interface
export = instance
