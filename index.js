#!/usr/bin/env node

'use strict';

var async = require('async');
var _ = require('underscore');
var pathUtils = require('path');
var fsUtils = require('fs');
var program = require('commander');
var Bar = require('cli-progress').Bar;
var expressionify = require('./utils/expressionify').expressionify;

var localScripts = require('./scripts');


var readConfig = function(params, callback) {
	async.waterfall([
		function(callback) {
			fsUtils.readFile(params.configPath, 'utf-8', callback);
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

var filterProjects = function(projects, filters) {
	var evalTagsExpression;
	if (filters.tag) {
		evalTagsExpression = expressionify(filters.tag);
	}

	return _(projects).chain()
		.filter(function(project) {
			return !filters.projects ||
				_(filters.projects).contains(project.name);
		})
		.filter(function(project) {
			return !filters.tag || evalTagsExpression({
				parseOperand: function(operand) {
					return project.tags && project.tags.indexOf(operand) !== -1;
				}
			});
		})
		.value();
};

var getScript = function(scriptName, config) {
	var scriptInfo = _(config.scripts).findWhere({name: scriptName});

	// get default gramp script if exists
	if (localScripts[scriptName]) return localScripts[scriptName];

	if (!scriptInfo) {
		throw new Error('Unknown script: ' + scriptName);
	}

	var scriptPath = pathUtils.join(process.cwd(), scriptInfo.path);
	return require(scriptPath);
};

var getReporter = function(reporterName) {
	return require('./reporters/' + reporterName);
};


var listOptionParser = function(val) {
  return val.split(',');
};

program
	['arguments']('<script> [scriptArguments...]')
	.description('Execute script on given projects structure')
	.option(
		'-p, --projects <projectNames...>',
		'list of projects which will be processed',
		listOptionParser
	)
	.option(
		'-t, --tag [tagExpression]',
		'boolean expression with tags to filter projects which will be processed'
	)
	.option(
		'-r, --reporter [reporter]',
		'which reporter use to log execution statistics, `simple` by default',
		'simple'
	)
	.option(
		'-c, --config [configPath]',
		'which reporter use to log execution statistics, `.gramprc` in working ' +
		'directory by default',
		pathUtils.join(process.cwd(), '.gramprc')
	)
	.parse(process.argv);

var opts = program.opts();
var scriptName = program.args[0];
var scriptArguments = _(program.args).rest();

async.waterfall([
	function(callback) {
		readConfig({
			configPath: opts.config
		}, callback);
	},
	function(config, callback) {
		var script = getScript(scriptName, config);
		var projects = filterProjects(
			config.projects, opts
		);

		var bar = new Bar({
			stopOnComplete: true,
			etaBuffer: Math.ceil(projects.length * 0.1)
		});

		var statistics = _(projects).map(function(project) {
			return {
				project: project,
				status: 'waiting'
			};
		});

		bar.start(projects.length, 0);
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

					bar.increment();
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
