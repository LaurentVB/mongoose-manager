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

exports.isObjectId = function(field){
    return field.options && field.options.type.name == "ObjectId";
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

exports.isString = function(field){
    return field.options && field.options.type == String;
};

exports.isFreeTextSearchable = function(field){
    return exports.isString(field);
};

exports.isArray = function(field){
    return field.options && _.isArray(field.options.type);
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

exports.isNotTechnical = function(fieldName) {
    return fieldName != '_id' && fieldName != '__v';
}
