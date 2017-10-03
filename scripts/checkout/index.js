'use strict';

var exec = require('exec');
var asyn = require('async');

var checkoutGit = function(params, callback) {

};

var checkoutHg = function(params, callback) {

};

exports.run = function(params, callback) {
	var project = params.project;
	var args = params.args;

	async.waterfall([
		function(callback) {
			switch (project.repository.type) {
				case 'git':
					checkoutGit(params, callback);
					break;

				case 'hg':
					checkoutHg(params, callback);
					break;

				default:
					throw new Error(
						'Unsupported repository type: ' + project.repository.type
					);
			}
		}
	], callback);
};
