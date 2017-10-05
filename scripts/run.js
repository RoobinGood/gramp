'use strict';

var async = require('async');
var exec = require('../utils/exec').exec;


exports.run = function(params, callback) {
	var project = params.project;
	var args = params.args;

	var results = [];
	var runCommand = function(command, callback) {
		async.waterfall([
			function(callback) {
				exec(
					'/bin/sh', ['-c', command],
					{cwd: project.repository.path},
					callback
				);
			},
			function(result, callback) {
				results.push({
					command: command,
					result: result
				});
				return callback(null);
			}
		], callback);
	};

	async.waterfall([
		function(callback) {
			async.eachOfLimit(
				args,
				1,
				function(command, index, callback) {
					runCommand(command, callback);
				},
				callback
			);
		},
		function(callback) {
			callback(null, results);
		}
	], callback);
};
