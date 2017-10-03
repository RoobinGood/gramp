'use strict';

var _ = require('underscore');

_([
	'checkout', 'npm', 'status'
]).each(function(scriptName) {
	exports[scriptName] = require('./' + scriptName);
});
