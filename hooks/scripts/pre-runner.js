var path = require('path')
var findup = require('../../libs/fs/findup')
var runner = require('./runner')

var root = path.dirname(findup.git())
runner(root, process.argv[2])
