'use strict';

var _ = require('underscore');
var async = require('async');
var exec = require('../../utils/exec').exec;
var pathUtils = require('path');
var expressionify = require('expressionify');
var npmUtils = require('../../utils/npm');

var parseDependencies = function(params) {
	var packageJson = require(
		pathUtils.join(params.repository.path, 'package.json')
	);

	return _(params.dependencies).map(function(dependency) {
		var dependencyInfo = npmUtils.parseDependency(dependency);
		return npmUtils.extendDependencyInfo(dependencyInfo, packageJson);
	});
};

var manageDependencies = function(params, callback) {
	var result = {};
	async.eachOf(
		params.dependencies,
		function(dependency, index, callback) {
			async.waterfall([
				function(callback) {
					var npmArgs = [params.command];

					var type = params.type || dependency.type;
					if (type === 'prod') {
						npmArgs.push('--save')
					} else {
						npmArgs.push('--save-dev')
					}

					npmArgs.push('--save-exact');
					npmArgs.push(dependency.raw);

					exec(
						'npm', npmArgs,
						{cwd: params.cwd},
						callback
					);
				},
				function(commandResult, callback) {
					result[dependency.raw] = commandResult.exitCode ?
						commandResult.errData : 'ok';

					callback();
				}
			], callback);
		},
		function(err) {
			if (err) return callback(err);

			callback(null, result);
		}
	);
};

var install = function(params, callback) {
	manageDependencies({
		dependencies: params.dependencies,
		command: 'install',
		type: params.dependencyType,
		cwd: params.repository.path
	}, callback);
};

var uninstall = function(params, callback) {
	manageDependencies({
		dependencies: params.dependencies,
		command: 'uninstall',
		cwd: params.repository.path
	}, callback);
};

var update = function(params, callback) {
	var dependencies = _(params.dependencies).where({installed: true});

	manageDependencies({
		dependencies: dependencies,
		command: 'install',
		cwd: params.repository.path
	}, callback);
};

var showVersion = function(params, callback) {
	var packageJson = require(
		pathUtils.join(params.repository.path, 'package.json')
	);

	return callback(null, {
		version: packageJson.version
	});
};

exports.run = function(params, callback) {
	var project = params.project;
	var args = params.args;

	var command = _(args).first();
	var commandParams = {
		repository: project.repository
	};

	var dependencies = _(args).rest();
	if (!_(dependencies).isEmpty()) {
		dependencies = parseDependencies({
			repository: project.repository,
			dependencies: dependencies
		});
		commandParams.dependencies = dependencies;
	}

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

				case 'showVersion':
					showVersion(commandParams, callback);
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
