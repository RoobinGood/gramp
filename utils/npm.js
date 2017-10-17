'use strict';

var _ = require('underscore');

exports.parseDependency = function(dependency, packageJson) {
	var result = {
		raw: dependency
	};

	var parts;
	var scoped = dependency.charAt(0) === '@';
	if (scoped) {
		parts = dependency.substr(1).split('@');
		parts[0] = '@' + parts[0];
	} else {
		parts = dependency.split('@');
	}

	var name = parts[0];
	var version = parts[1];

	result.name = name;
	if (version) {
		result.version = version;
	}

	return result;
};

exports.extendDependencyInfo = function(dependencyInfo, packageJson) {
	var result = {
		installed: true
	};

	if (_(packageJson.dependencies).has(dependencyInfo.name)) {
		result.type = 'prod';
	} else if (_(packageJson.devDependencies).has(dependencyInfo.name)) {
		result.type = 'dev';
	} else {
		result.installed = false;
	}

	return _(result).extend(dependencyInfo);
};
