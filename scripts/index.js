'use strict';

var _ = require('underscore');

_([
	'run', 'npm', 'repo'
]).each(function(scriptName) {
	exports[scriptName] = require('./' + scriptName);
});
