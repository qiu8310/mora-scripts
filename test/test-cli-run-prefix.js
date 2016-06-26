var color = require('../libs/sys/color');
var assert = require('assert');

var pkg = require('../package');
var args = process.argv.slice(2);

assert.equal(args[0], '-v');
assert.equal(args[1], pkg.version);
assert.equal(args[2], '--foo');
assert.equal(args[3], '** I am foo **');

color('%cTest cli/run:prefix OK', 'c.green.bold');
