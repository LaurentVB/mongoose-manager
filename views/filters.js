var moment = require('moment'),
    _ = require('underscore'),
    ejs = require('ejs');

exports.empty = function(str) {
    return str || '';
};

exports.formatDate = function(date, format) {
    if (!date){
        return '';
    }
    format = format || 'YYYY-MM-DD';

    return moment(date).format(format);
};

/**
 * Creates the query string corresponding to the passed criteria.
 *
 * @param search the criteria to output the query string for.
 * @returns {string}
 */
exports.queryString = function(search) {
    var params = [];
    _.each(search.criteria, function(value, key){
        params.push(key + '=' + encodeURIComponent(value));
    });
    return '?' + params.join('&');
};


var inputTpl = ejs.compile('<input type="hidden" name="<%= key %>" value="<%= value %>">');
/**
 * Creates the hidden inputs string corresponding to the passed criteria.
 *
 * @param search the criteria to output the hidden input fields for.
 * @returns {string}
 */
exports.formInput = function(search) {
    var inputs = [];
    _.each(search.criteria, function(value, key){
        inputs.push(inputTpl({key: key, value: value}));
    });
    return inputs.join('\n');
};