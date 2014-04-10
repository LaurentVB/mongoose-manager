var _ = require('underscore');

exports.EMPTY = '__EMPTY__';

exports.url = function(req){
    var url = Array.prototype.slice.call(arguments, 1).join(['/']);
    return req.app.path() + '/' + url;
};

exports.isBoolean = function(field){
    return field.options && field.options.type == Boolean;
};

exports.isDate = function(field){
    return field.options && field.options.type == Date;
};

exports.isRef = function(field){
    return field.options && field.options.ref;
};

exports.hasEnum = function(field) {
    return 'enum' in field.options;
};

exports.isNullable = function(field){
    return ! field.options.required;
};

exports.isFreeTextSearchable = function(field){
    return field.options && field.options.type == String;
};

exports.getField = function(document, fieldName){
    return document.schema.paths[fieldName] || document.schema.virtuals[fieldName];
};

exports.isVirtual = function(document, fieldName) {
    return fieldName in document.schema.virtuals;
};

exports.isNotVirtual = function(document, fieldName) {
    return !exports.isVirtual(document, fieldName);
};

/**
 * Returns the value to use in a search query to find empty/null values for the field.
 *
 * @param document the model
 * @param fieldName the name of the field
 * @returns {*}
 */
exports.nullSearchValue = function(document, fieldName) {
    var type = document.schema.paths[fieldName].options.type;
    if (type == String){
        return '';
    }
    if (_.isArray(type)){
        return [];
    }
    return null;
};
