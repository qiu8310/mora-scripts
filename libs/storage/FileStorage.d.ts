import * as Storage from './Storage'

declare namespace FileStorage {
  interface Options extends Storage.Options {
    /**
     * 指定要存储到的文件
     */
    file: string
  }
}

declare class FileStorage extends Storage {
  constructor(options: FileStorage.Options)
}

export = FileStorage
