'use strict';

var _ = require('underscore');
var async = require('async');
var exec = require('../../utils/exec').exec;
var pathUtils = require('path');

var dependencyVersionRegexp = /\b@(.*)$/;
var parseDependencies = function(params) {
	var packageJson = require(
		pathUtils.join(params.repository.path, 'package.json')
	);

	return _(params.dependencies)
		.map(function(dependency) {
			var result = {
				raw: dependency,
				installed: true
			};

			var versionMatch = dependencyVersionRegexp.exec(dependency);
			if (versionMatch && versionMatch.length === 2) {
				result.version = versionMatch[1];
				result.name = dependency.replace(versionMatch[0], '');
			} else {
				result.name = dependency;
			}

			if (_(packageJson.dependencies).has(result.name)) {
				result.type = 'prod';
			} else if (_(packageJson.devDependencies).has(result.name)) {
				result.type = 'dev';
			} else {
				result.installed = false;
			}

			return result;
		});
};

var manageDependency = function(params, callback) {
	var npmArgs = [params.command];

	if (params.type === 'prod') {
		npmArgs.push('--save')
	} else {
		npmArgs.push('--save-dev')
	}

	npmArgs.push('--save-exact');
	npmArgs.push(params.name);

	exec(
		'npm', npmArgs,
		{cwd: params.cwd},
		callback
	);
};

var install = function(params, callback) {
	async.waterfall([
		function(callback) {
			async.eachOf(
				params.dependencies,
				function(dependency, index, callback) {
					manageDependency({
						command: 'install',
						type: params.dependencyType,
						name: dependency.raw,
						cwd: params.repository.path
					}, callback);
				},
				callback
			);
		}
	], callback);
};

var uninstall = function(params, callback) {
	async.waterfall([
		function(callback) {
			async.eachOf(
				params.dependencies,
				function(dependency, index, callback) {
					manageDependency({
						command: 'uninstall',
						type: dependency.type,
						name: dependency.raw,
						cwd: params.repository.path
					}, callback);
				},
				callback
			);
		}
	], callback);
};

var update = function(params, callback) {
	async.waterfall([
		function(callback) {
			var dependencies = _(params.dependencies).where({installed: true});

			async.eachOf(
				dependencies,
				function(dependency, index, callback) {
					manageDependency({
						command: 'install',
						type: dependency.type,
						name: dependency.raw,
						cwd: params.repository.path
					}, callback);
				},
				callback
			);
		}
	], callback);
};

exports.run = function(params, callback) {
	var project = params.project;
	var args = params.args;

	var command = _(args).first();
	var dependencies = parseDependencies({
		repository: project.repository,
		dependencies: _(args).rest()
	});

	var commandParams = {
		repository: project.repository,
		dependencies: dependencies
	};

	async.waterfall([
		function(callback) {
			switch (command) {
				case 'update':
					update(commandParams, callback);
					break;

				case 'install':
					commandParams.dependencyType = 'prod';
					install(commandParams, callback);
					break;

				case 'installDev':
					commandParams.dependencyType = 'dev';
					install(commandParams, callback);
					break;

				case 'uninstall':
					uninstall(commandParams, callback);
					break;

				default:
					throw new Error(
						'Unsupported command: ' + command
					);
			}
		},
		function(result, callback) {
			callback(null, result)
		}
	], callback);
};
