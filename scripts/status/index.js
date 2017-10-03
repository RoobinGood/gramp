'use strict';

var _ = require('underscore');
var async = require('async');
var exec = require('exec-cmd');


var checkoutGit = function(params, callback) {
	async.waterfall([
		function(callback) {
			exec(
				'git', ['rev-parse', '--abbrev-ref', 'HEAD'],
				{cwd: params.repository.path},
				callback
			);
		},
		function(branchOutput, callback) {
			var result = {
				branch: branchOutput[0]
			};

			callback(null, result);
		}
	], callback);
};

var checkoutHg = function(params, callback) {
	async.waterfall([
		function(callback) {
			exec(
				'hg', ['branch'],
				{cwd: params.repository.path},
				callback
			);
		},
		function(branchOutput, callback) {
			var result = {
				branch: branchOutput[0]
			};

			callback(null, result);
		}
	], callback);
};

exports.run = function(params, callback) {
	var project = params.project;
	var args = params.args;

	var commandParams = {
		repository: project.repository
	};

	async.waterfall([
		function(callback) {
			switch (project.repository.type) {
				case 'git':
					checkoutGit(commandParams, callback);
					break;

				case 'hg':
					checkoutHg(commandParams, callback);
					break;

				default:
					throw new Error(
						'Unsupported repository type: ' + project.repository.type
					);
			}
		},
		function(result, callback) {
			callback(null, result)
		}
	], callback);
};
