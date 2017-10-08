'use strict';

var _ = require('underscore');

var subscripts = {};
_([
	'status', 'checkout'
]).each(function(subscriptName) {
	subscripts[subscriptName] = require('./' + subscriptName);
});

exports.run = function(params, callback) {
	var args = params.args;
	var project = params.project;

	var subscriptName = _(args).first();
	var subscriptParams = {
		repository: project.repository,
		args: _(args).rest()
	};

	if (!subscripts[subscriptName]) {
		throw new Error('Unknown repo subscript: ' + subscriptName);
	}

	subscripts[subscriptName].run(subscriptParams, callback);
};
