var color = require('../libs/sys/color');
var assert = require('assert');

var env = process.env;

assert.equal(env.a, 'a');
assert.equal(env.b, 'b b');
assert.equal(env.c, '* .');

color('%cTest cli/run:env OK', 'c.green.bold');
