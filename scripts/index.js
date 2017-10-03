'use strict';

var _ = require('underscore');

_([
	'checkout', 'dependency', 'status'
]).each(function(scriptName) {
	exports[scriptName] = require('./' + scriptName);
});
