
interface Interface {
  /**
   * 根据文件 file 中的注释，注入 data 中对应的内容
   *
   * GROUP   |  EXTENSIONS                          |  TAGS
   * --------|--------------------------------------------------------------
   * hash    |  gitignore, sh, bash                 | ['## ', ' ##', '## ', ' ##']
   * docs    |  js, jsx, css, sass, ts, tsx, json   | (多行注释后面加个 "#")
   * html    |  html, md                            | ['<!--# ', ' #-->', '<!--# ', ' #-->']
   * loose   |  支持上面所有的后缀                     | ['# ', ' #', '# ', ' #']
   *
   * @param  {string} file      要注入的文件的文件路径
   * @param  {Object} data      要注入的内容
   * @param  {Object} [options] 选项
   * @param  {string|Array<string>} [options.tags]     [tagStartLeft, tagStartRight, tagEndLeft, tagEndRight]
   * @param  {boolean} [options.autoPrefixSpaces = true]  自动根据最后一个注释前的空格给每一行都添加相同的空格
   * @param  {boolean} [options.returnContent = false]  返回注入的内容，而不是直接注入
   * @example
   * ```
   * bash 中可以这样写： (type 默认是 string，可以不写，另外支持 file，这时 key 对应的 value 是文件地址)
   *
   *  ## INJECT_START {"type": "string", "key": "ignores"} ##
   *
   *  ## INJECT_END ##
   *
   * 或
   *
   *  ## INJECT_START ignores ##
   *  ## INJECT_END ##
   * ```
   *
   * @return {number}         返回注入成功的数量
   */
  (file: string, data: {[key: string]: string | ((oldValue: string) => string)}, options?: {
    autoPrefixSpaces?: boolean
    returnContent?: boolean,
    append?: boolean,
    tags?: 'loose' | 'hash' | 'docs' | 'html' | string[],
    eol?: '\n' | '\r\n' | string  
}): number | string
}

declare const instance: Interface
export = instance

