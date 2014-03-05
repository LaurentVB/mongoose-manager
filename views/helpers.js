var moment = require('moment'),
    _ = require('underscore'),
    ejs = require('ejs'),
    fs = require('fs');

var helpers = {
    _ : _,
    moment: moment
};

module.exports.init = function(admin){

    return function(req, res, next){

        /**
         * Builds a domain-relative URL in the admin interface by joining the passed arguments
         * with a '/' (forward-slash) and prefixing by the application mount path.
         *
         * @returns {string}
         */
        res.locals.url = require('../lib/utils').url.bind(res.locals, req);

        res.locals.req = req;

        res.locals.tableFormat = function(fieldName, document){
            var value = document[fieldName],
                field = document.schema.paths[fieldName] || document.schema.virtuals[fieldName];

            if (!field) {
                throw new Error('Unknown field %s in model %s', fieldName, document.schema.modelName);
            }

            if (!value){
                return '';
            }

            if (field.options && field.options.type == Date){
                return moment(value).format('YYYY/MM/DD hh:mm:ss');
            }

            if (field.options && field.options.type.name == 'ObjectId'){
                return res.locals.label(value, field.options.ref);
            }

            return value;
        };

        res.locals.label = function(document, modelName){
            var labelField;
            if (labelField = admin.models[modelName].label){
                return _.isFunction(labelField) ? labelField(document) : document[labelField];
            }
            if ('label' in document.schema.paths && document.schema.paths.label.options.type == String){
                return document.label;
            }
            if ('name' in document.schema.paths && document.schema.paths.name.options.type == String){
                return document.name;
            }
            return document;
        };

        res.locals = _.extend(res.locals, helpers);

        next();
    };

};
