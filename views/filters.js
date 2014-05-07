var moment = require('moment'),
    _ = require('underscore'),
    ejs = require('ejs');

exports.empty = function(str) {
    return str || '';
};
