var supportColor = require('./supportColor')()
/* istanbul ignore next */
module.exports = supportColor ? {
  error: '\x1b[31m',
  info: '\x1b[36m',
  success: '\x1b[32m',
  warn: '\x1b[33m',
  end: '\x1b[0m'
} : {
  error: '',
  info: '',
  success: '',
  warn: '',
  end: ''
}
