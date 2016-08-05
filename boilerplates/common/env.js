let nodeEnv = process.env.NODE_ENV || 'development'

module.exports = {
  ENV: nodeEnv,
  DEV: /dev/i.test(nodeEnv),
  MOCK: /mock/i.test(nodeEnv),
  BUILD: /(build|prod)/i.test(nodeEnv),
  DEBUG: /debug/i.test(nodeEnv),
  TEST: /test/i.test(nodeEnv)
}
