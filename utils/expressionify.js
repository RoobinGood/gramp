'use strict';

var expressionify = require('expressionify');

var booleanOperators = {
	'|': {
		execute: function(x, y) { return x || y; },
		priority: 1,
		type: 'binary'
	},
	'&': {
		execute: function(x, y) { return x && y; },
		priority: 2,
		type: 'binary'
	},
	'^': {
		execute: function(x, y) { return x ^ y; },
		priority: 2,
		type: 'binary'
	},
	'!': {
		execute: function(x) { return !x; },
		priority: 3,
		type: 'unary'
	}
};

exports.expressionify = function(expression) {
	return expressionify(expression, {
		operators: booleanOperators
	});
};
