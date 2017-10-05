'use strict';

var spawn = require('child_process').spawn;
var _ = require('underscore');

exports.exec = function(cmd, args, options, callback) {
	if (_(options).isFunction()) {
		callback = options;
		options = {};
	}
	callback = _(callback).once();

	options = _({}).extend(
		{stdio: 'pipe'},
		options
	);

	var cmdSpawn = spawn(cmd, args, options);

	var outData = '';
	cmdSpawn.stdout.on('data', function(data) {
		outData += data;
	});

	var errData = '';
	cmdSpawn.stderr.on('data', function(data) {
		errData += data;
	});

	cmdSpawn.on('close', function(code) {
		callback(null, {
			exitCode: code,
			outData: outData,
			errData: errData
		});
	});

	cmdSpawn.on('error', callback);

	return cmdSpawn;
};
