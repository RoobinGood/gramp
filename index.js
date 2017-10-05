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

var filterProjects = function(projects, filters) {
	return _(projects).chain()
		.filter(function(project) {
			return !filters.projects ||
				_(filters.projects).contains(project.name);
		})
		.filter(function(project) {
			return !filters.tags.length ||
				_(filters.tags).intersection(project.tags).length > 0;
		})
		.value();
};

var getReporter = function(reporterName) {
	return require('./reporters/' + reporterName);
};


var listOptionParser = function(val) {
  return val.split(',');
};

program
	['arguments']('[options] <script> [scriptArguments...]')
	.description('Execute script on given projects structure')
	.option(
		'-p, --projects <projectNames...>',
		'list of projects which will be processed',
		listOptionParser
	)
	.option(
		'-t, --tags <tags...>',
		'list of tags which will be processed',
		listOptionParser, []
	)
	.option(
		'-r, --reporter [reporter]',
		'which reporter use to log execution statistics, `simple` by default',
		'simple'
	)
	.allowUnknownOption()
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
		var projects = filterProjects(
			config.projects, opts
		);

		var statistics = _(projects).map(function(project) {
			return {
				project: project,
				status: 'waiting'
			};
		});

		async.eachOfLimit(
			projects,
			3,
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
		var reporter = getReporter(opts.reporter);
		reporter.show({
			statistics: statistics
		});

		return callback();
	}
], function(err) {
	if (err) console.error(err.stack || err);
});
