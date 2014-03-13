var async = require('async'),
    utils = require('../utils');

exports.init = function(admin){

    admin.app.get('/:model', loadDocuments);
    admin.app.delete('/:model', deleteDocuments);

    function loadDocuments(req, res, next){
        var pageSize = res.locals.pageSize = admin.options.pageSize,
            model = res.locals.model = admin.getModel(req.params.model),
            page = res.locals.page = parseInt(req.query.page, 10) || 1,
            skip = res.locals.skip = (page - 1) * pageSize,
            q = res.locals.q = req.query.q,
            where = res.locals.where = req.query.where,
            fields = res.locals.fields = admin.getListFields(req.params.model);

        try {
            var parsed = JSON.parse(where || '{}');
        } catch(e) {
            res.locals.errors.where = 'Could not parse where clause. It must be valid JSON.';
            return res.render('list');
        }

        async.parallel([
            function(cb){
                model.count(parsed, cb);
            },
            function(cb){
                model.find(parsed).limit(pageSize).skip(skip).exec(function(err, documents){
                    if (err) return cb(err);

                    var fieldsToPopulate = fields.filter(function(f){
                        var field = utils.getField(model, f);
                        return field.options && 'ref' in field.options;
                    });

                    model.populate(documents, fieldsToPopulate, function(){
                        cb(err, documents);
                    });
                });
            }
        ], function(err, results){
            if (err) return next(err);

            res.render('list', {
                documents : results[1],
                count : results[0],
                actions: admin.getActions(req.params.model)
            });
        });
    }

    function deleteDocuments(req, res, next){
        var model = admin.getModel(req.params.model);

        model.find().where('_id').in(req.body.ids).exec(function(err, documents){

            // in order to honor middleware, each document is loaded and then removed
            async.each(documents, function(document, next){
                document.remove(function(err){
                    next(err);
                });
            }, function(err){
                res.redirect(utils.url(req, model.modelName));
            });
        });
    }
};

