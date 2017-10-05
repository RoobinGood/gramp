'use strict';

var _ = require('underscore');
var async = require('async');
var exec = require('../../utils/exec').exec;


var checkoutGit = function(params, callback) {
	async.waterfall([
		function(callback) {
			exec(
				'git', ['checkout', params.branch],
				{cwd: params.repository.path},
				callback
			);
		},
		function(result, callback) {
			callback(null, result);
		}
	], callback);
};

var checkoutHg = function(params, callback) {
	async.waterfall([
		function(callback) {
			exec(
				'hg', ['update', params.branch],
				{cwd: params.repository.path},
				callback
			);
		},
		function(result, callback) {
			callback(null, result);
		}
	], callback);
};

exports.run = function(params, callback) {
	var project = params.project;
	var args = params.args;

	var commandParams = {
		repository: project.repository,
		branch: _(args).first()
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
