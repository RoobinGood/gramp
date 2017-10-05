'use strict';

var _ = require('underscore');

_([
	'run', 'checkout', 'npm', 'status'
]).each(function(scriptName) {
	exports[scriptName] = require('./' + scriptName);
});
