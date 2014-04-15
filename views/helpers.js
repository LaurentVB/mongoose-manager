var moment = require('moment'),
    _ = require('underscore'),
    ejs = require('ejs'),
    fs = require('fs'),
    utils = require('../lib/utils');

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
        res.locals.getField = require('../lib/utils').getField;
        res.locals.utils = require('../lib/utils');

        res.locals.readOnly = function(model, fieldName){
            if (utils.isNotVirtual(model, fieldName)){
                return false;
            }
            var field = utils.getField(model, fieldName);
            return (!field.setters || !field.setters.length);
        };

        res.locals.req = req;

        res.locals.tableValueFormat = function(value, fieldName, document, maxLength){
            var field = utils.getField(document, fieldName);

            if (!field) {
                throw new Error('Unknown field %s in model %s', fieldName, document.schema.modelName);
            }

            if (utils.isBoolean(field)){
                return value;
            }

            if (!value){
                return '';
            }

            if (utils.isDate(field)){
                return moment(value).format('YYYY/MM/DD hh:mm:ss');
            }

            if (utils.isRef(field)){
                return res.locals.label(value, field.options.ref);
            }

            value = value.toString();
            if (maxLength && value.length > maxLength){
                value = value.substring(0, maxLength) + '&hellip;';
            }
            return value;
        };

        res.locals.tableFormat = function(fieldName, document, maxLength){
            return res.locals.tableValueFormat(document[fieldName], fieldName, document, maxLength);
        };

        res.locals.label = function(document, modelName){
            var labelField;
            if (labelField = admin.models[modelName].label){
                return _.isFunction(labelField) ? labelField(document) : document[labelField];
            }
            if ((labelField = utils.getField(document, 'label')) && labelField.options.type == String){
                return document.label;
            }
            if ((labelField = utils.getField(document, 'name')) && labelField.options.type == String){
                return document.name;
            }
            return document;
        };

        res.locals.noColon = function(word, replacement){
            return word.replace(/\./g, replacement || '_');
        };

        res.locals.notifications = function(){
            return req.flash('notification');
        };

        res.locals = _.extend(res.locals, helpers);

        next();
    };

};
