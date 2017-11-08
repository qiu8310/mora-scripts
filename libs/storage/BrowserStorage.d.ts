import * as Storage from './Storage'

declare namespace BrowserStorage {
  interface Options extends Storage.Options {
    /**
     * 指定要存储到的 localStorage 的 key
     */
    key: string
  }
}

declare class BrowserStorage extends Storage {
  constructor(options: BrowserStorage.Options)
}

export = BrowserStorage
