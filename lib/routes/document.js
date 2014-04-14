var async = require('async'),
    utils = require('../utils'),
    _ = require('underscore');

exports.init = function(admin){

    admin.app.get('/:model/:id', loadOrCreateDocument, displayDocument);
    admin.app.post('/:model', createDocument, saveDocument);
    admin.app.put('/:model/:id', loadDocument, saveDocument);
    admin.app.delete('/:model/:id', loadDocument, deleteDocument);

    function displayDocument(req, res, next){
        var model = admin.getModel(req.params.model);
        populateReferences(res.locals.document, function(err, references){
            if (err) return next(err);

            res.render('model', {
                model: model,
                fields: admin.getFields(req.params.model),
                references: references
            });
        });
    }

    function createDocument(req, res, next){
        var model = admin.getModel(req.params.model);
        res.locals.document = new model();
        res.locals.document._id = null;
        next();
    }

    function loadDocument(req, res, next){
        var model = admin.getModel(req.params.model),
            id = req.params.id;
        model.findById(id, function(err, document){
            res.locals.document = document;
            next(err);
        });
    }

    function loadOrCreateDocument(req, res, next){
        if (req.params.id === 'new'){
            createDocument(req, res, next);
        } else {
            loadDocument(req, res, next);
        }
    }

    function saveDocument(req, res, next){
        var model = admin.getModel(req.params.model),
            document = res.locals.document;

        document.set(req.body);
        setEmptyFields(document, req.body);
        document.save(function(err){
            if (err) return next(err);

            res.redirect(utils.url(req, model.modelName, document.id));
        });
    }

    function deleteDocument(req, res, next){
        var model = admin.getModel(req.params.model),
            document = res.locals.document;

        document.remove(function(err){
            if (err) return next(err);

            res.redirect(utils.url(req, model.modelName));
        });
    }

    function setEmptyFields(document, fields){
        document.schema.eachPath(function(p){
            // checkboxes don't send the value back if they're not checked, so force 'false' value for boolean fields
            if (utils.isBoolean(utils.getField(document, p)) && !(p in fields)){
                document[p] = false;
            }
            // empty arrays don't send values back either
            if (utils.isArray(utils.getField(document, p)) && !(p in fields)){
                document[p] = [];
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

            var references = {};
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
