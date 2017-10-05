'use scripts';

var _ = require('underscore');

exports.show = function(params, callback) {
	console.log();
	_(params.statistics).each(function(statistics) {
		console.log(
			'project: %s (%s) [%s]',
			statistics.project.name,
			statistics.project.repository.path,
			statistics.project.repository.type
		);
		console.log('status: %s', statistics.status);
		console.log('result: %s\n', JSON.stringify(statistics.result, null, 2));
	});
};
