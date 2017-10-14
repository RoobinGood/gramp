'use scripts';

var _ = require('underscore');

exports.show = function(params, callback) {
	console.log(JSON.stringify(params.statistics, null, 2));
};
