var assert = require('assert');
var wfhlib = require('./wfhlib.js');

var country = { id: 237, name: 'United States' };

assert.equal(wfhlib.displayId(10), '(10)');
assert.equal(wfhlib.getUrl('https://www.wfh.io', '/jobs/10'), 'https://www.wfh.io/jobs/10');
assert.equal(wfhlib.getCountry(undefined), 'Anywhere');
assert.equal(wfhlib.getCountry(country), 'United States');
