var assert = require('assert');

var pkg = require('../package');
var args = process.argv.slice(2);

assert.equal(args[0], '-v');
assert.equal(args[1], pkg.version);
assert.equal(args[2], '--bar');
assert.equal(args[3], 'args.foo: I am foo');

console.log('cli run.js is ok');
