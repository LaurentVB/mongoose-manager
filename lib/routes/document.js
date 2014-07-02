var async = require('async'),
    utils = require('../utils'),
    _ = require('underscore');

exports.init = function(admin){

    admin.app.get('/:model/new', createDocument, displayDocument);
    admin.app.get('/:model/:id', loadDocument, displayDocument);
    admin.app.post('/:model', createDocument, saveDocument);
    admin.app.put('/:model/:id', loadDocument, saveDocument);
    admin.app.delete('/:model/:id', loadDocument, deleteDocument);

    function displayDocument(req, res, next){
        populateReferences(res.locals.document, function(err, references){
            if (err) return next(err);

            var fields = admin.getFields(req.params.model);

            if (typeof req.query.bulk != 'undefined'){
                res.locals.fieldPrefix = 'fields';
                fields = fields.filter(function(field){
                    return utils.isBulkEditField(res.locals.model, field);
                });
            }

            res.render('model', {
                fields: fields,
                references: references
            });
        });
    }

    function createDocument(req, res, next){
        var model = res.locals.model;
        res.locals.document = new model();
        next();
    }

    function loadDocument(req, res, next){
        var model = res.locals.model,
            id = req.params.id;
        model.findById(id, function(err, document){
            res.locals.document = document;
            next(err);
        });
    }

    function saveDocument(req, res, next){
        var model = res.locals.model,
            document = res.locals.document;

        cleanupEmptyFields(document, req.body);
        document.set(req.body);

        document.save(function(err){
            if (err) return next(err);

            req.flash('notification', {
                level: 'success',
                text: 'Document saved successfully'
            });

            res.redirect(utils.url(req, model.modelName, document._id));
        });
    }

    function deleteDocument(req, res, next){
        var model = res.locals.model,
            document = res.locals.document;

        document.remove(function(err){
            if (err) return next(err);

            req.flash('notification', {
                level: 'success',
                text: 'Document deleted'
            });

            res.redirect(utils.url(req, model.modelName));
        });
    }

    function cleanupEmptyFields(document, fields){
        document.schema.eachPath(function(p){
            // checkboxes don't send the value back if they're not checked, so force 'false' value for boolean fields
            if (utils.isBoolean(utils.getField(document, p)) && !(p in fields)){
                fields[p] = false;
            }
            // empty arrays don't send values back either
            if (utils.isArray(utils.getField(document, p)) && !(p in fields)){
                fields[p] = [];
            }
            // empty string cannot be cast to ObjectId
            if (utils.isObjectId(utils.getField(document, p)) && fields[p] == ''){
                fields[p] = null;
            }
        });
    }

    function populateReferences(document, cb){
        var refs = {};
        document.schema.eachPath(function(p){
            if ('ref' in document.schema.paths[p].options){
                refs[p] = document.schema.paths[p].options.ref;
            }
        });
        document.populate(Object.keys(refs), function(err){
            if (err) return cb(err);

            async.each(Object.keys(refs), function(ref, next){
                var model = admin.getModel(refs[ref]);
                model.find({}, function(err, models){
                    refs[ref] = models;
                    next(err);
                });
            }, function(err){
                cb(err, refs);
            })
        });
    }
};
