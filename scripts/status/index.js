'use strict';

var _ = require('underscore');
var async = require('async');
var exec = require('../../utils/exec').exec;

var processOutput = function(params) {
	var changedFiles = params.changedFiles.outData.trim();
	var repositoryClear = Boolean(changedFiles === '');

	var result = {
		branch: params.branch.outData.trim(),
		repositoryState: repositoryClear ? 'clear' : 'dirty',
		changedFiles: changedFiles.split('\n'),
		untrackedFiles: params.untrackedFiles.outData.trim().split('\n')
	};

	return result;
};

var checkoutGit = function(params, callback) {
	async.waterfall([
		function(callback) {
			async.parallel([
				function(callback) {
					exec(
						'git', ['rev-parse', '--abbrev-ref', 'HEAD'],
						{cwd: params.repository.path},
						callback
					);
				},
				function(callback) {
					exec(
						'git', ['diff', '--name-status', 'HEAD'],
						{cwd: params.repository.path},
						callback
					);
				},
				function(callback) {
					exec(
						'git', ['ls-files', '--others', '--exclude-standard'],
						{cwd: params.repository.path},
						callback
					);
				}
			], callback);
		},
		function(results, callback) {
			callback(null, processOutput({
				branch: results[0],
				changedFiles: results[1],
				untrackedFiles: results[2]
			}));
		}
	], callback);
};

var checkoutHg = function(params, callback) {
	async.waterfall([
		function(callback) {
			async.parallel([
				function(callback) {
					exec(
						'hg', ['branch'],
						{cwd: params.repository.path},
						callback
					);
				},
				function(callback) {
					exec(
						'hg', ['status', '--modified', '--added', '--removed', '--deleted'],
						{cwd: params.repository.path},
						callback
					);
				},
				function(callback) {
					exec(
						'hg', ['status', '--unknown', '--no-status'],
						{cwd: params.repository.path},
						callback
					);
				}
			], callback);
		},
		function(results, callback) {
			callback(null, processOutput({
				branch: results[0],
				changedFiles: results[1],
				untrackedFiles: results[2]
			}));
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
