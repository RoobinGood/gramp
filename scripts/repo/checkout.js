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
			var info = result.outData || result.errData || '';
			info = info.trim();
			callback(null, {
				info: info
			});
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
			var info = result.outData || result.errData || '';
			info = info.trim();
			callback(null, {
				info: info
			});
		}
	], callback);
};

exports.run = function(params, callback) {
	var args = params.args;
	var repository = params.repository;

	var commandParams = {
		repository: repository,
		branch: _(args).first()
	};

	async.waterfall([
		function(callback) {
			switch (repository.type) {
				case 'git':
					checkoutGit(commandParams, callback);
					break;

				case 'hg':
					checkoutHg(commandParams, callback);
					break;

				default:
					throw new Error(
						'Unsupported repository type: ' + repository.type
					);
			}
		},
		function(result, callback) {
			callback(null, result)
		}
	], callback);
};
