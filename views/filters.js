var moment = require('moment');

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
