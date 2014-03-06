var async = require('async'),
    utils = require('../utils');

exports.init = function(admin){

    admin.app.get('/:model', loadDocuments);
    admin.app.delete('/:model', deleteDocuments);

    function loadDocuments(req, res, next){
        var pageSize = admin.options.pageSize,
            model = admin.getModel(req.params.model),
            page = parseInt(req.query.page, 10) || 1,
            skip = (page - 1) * pageSize,
            q = req.query.q,
            fields = admin.getListFields(req.params.model);

        async.parallel([
            function(cb){
                model.count(cb);
            },
            function(cb){
                model.find().limit(pageSize).skip(skip).exec(function(err, documents){
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
                model: model,
                documents : results[1],
                fields : fields,
                count : results[0],
                page : page,
                pageSize : pageSize,
                skip : skip,
                q: q,
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

