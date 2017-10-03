'use strict';

var async = require('async');
var _ = require('underscore');
var pathUtils = require('path');
var fsUtils = require('fs');
var program = require('commander');

var defaultScripts = require('./scripts');


var readConfig = function(callback) {
	async.waterfall([
		function(callback) {
			var configPath = pathUtils.join(process.cwd(), '.apmconfig');

			fsUtils.readFile(configPath, 'utf-8', callback);
		},
		function(config, callback) {
			config = JSON.parse(config);

			config.projects = _(config.projects).map(function(project) {
				project.repository.path = pathUtils.join(
					process.cwd(), project.repository.path
				);

				return project;
			});

			return callback(null, config);
		}
	], callback);
};

var getScript = function(scriptName, config) {
	var scriptInfo = _(config.scripts).findWhere({name: scriptName});

	// get default apm script if exists
	if (defaultScripts[scriptName]) return defaultScripts[scriptName];

	if (!scriptInfo) {
		throw new Error('Unknown script: ' + scriptName);
	}

	var scriptPath = pathUtils.join(process.cwd(), scriptInfo.path);
	return require(scriptPath);
};

program
	['arguments']('[options] <script> [scriptArguments...]')
	.description('Execute script on given projects structure')
	.parse(process.argv);

var opts = program.opts();
var scriptName = program.args[0];
var scriptArguments = _(program.args).rest();

async.waterfall([
	function(callback) {
		console.log('opts', opts)
		console.log('args', program.args)

		readConfig(callback);
	},
	function(config, callback) {
		var script = getScript(scriptName, config);
		var projects = config.projects;

		var statistics = _(projects).map(function(project) {
			return {
				project: project,
				status: 'waiting'
			};
		});
		async.eachOfLimit(
			projects,
			1,
			function(project, index, projectCallback) {
				statistics[index].status = 'processing';

				script.run({
					project: project,
					args: scriptArguments
				}, function(err, result) {
					if (err) {
						statistics[index].status = 'error';
						statistics[index].result = err;
					} else {
						statistics[index].status = 'success';
						statistics[index].result = result;
					}

					projectCallback();
				});
			},
			function() {
				callback(null, statistics);
			}
		);
	},
	function(statistics, callback) {
		console.log(statistics)
		return callback();
	}
], function(err) {
	if (err) console.error(err.stack || err);
});
