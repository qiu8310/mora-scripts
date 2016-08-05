const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('./webpack.config')
const { protocol, host, port } = config.meta.conf.server

new WebpackDevServer(webpack(config), config.devServer)
  .listen(port, host, function (err, result) {
    if (err) {
      return console.log(err)
    }

    console.log(`Listening at ${protocol}://${host}:${port}/`)
  })
