'use strict';

var async = require('async');
var _ = require('underscore');
var pathUtils = require('path');
var fsUtils = require('fs');
var program = require('commander');

var readConfig = function(callback) {
	async.waterfall([
		function(callback) {
			var configPath = pathUtils.join(process.cwd(), '.apmconfig');

			fsUtils.readFile(configPath, 'utf-8', callback);
		},
		function(config, callback) {
			config = JSON.parse(config);

			return callback(null, config);
		}
	], callback);
};

var apmScriptsPathRegexp = /^apm\//;
var getScript = function(scriptName, config) {
	var scriptInfo = _(config.scripts).findWhere({name: scriptName});
	if (!scriptInfo) {
		throw new Error('script ' + scriptName + ' is not specified in config');
	}

	var scriptPath = scriptInfo.path;
	if (apmScriptsPathRegexp.test(scriptInfo.path)) {
		scriptPath = scriptPath.replace(apmScriptsPathRegexp, './');
	}

	return require(scriptPath);
};

program
	['arguments']('<script> [scriptArguments...]')
	.description('Execute script on given projects structure')
	.parse(process.argv);

var scriptName = program.args[0];
var scriptArguments = _(program.args).rest();

async.waterfall([
	function(callback) {
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
