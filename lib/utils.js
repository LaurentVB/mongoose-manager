exports.url = function(req){
    var url = Array.prototype.slice.call(arguments, 1).join(['/']);
    return req.app.path() + '/' + url;
};

exports.getField = function(document, fieldName){
    return document.schema.paths[fieldName] || document.schema.virtuals[fieldName];
};

exports.isVirtual = function(document, fieldName) {
    return fieldName in document.schema.virtuals;
};