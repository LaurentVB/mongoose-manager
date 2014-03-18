var utils = require('../utils'),
    _ = require('underscore'),
    Search = require('../search').Search;

exports.init = function(admin){

    admin.app.get('/:model', loadDocuments);
    admin.app.delete('/:model', deleteDocuments);

    function loadDocuments(req, res, next){
        var model = res.locals.model = admin.getModel(req.params.model),
            fields = res.locals.fields = admin.getListFields(req.params.model),
            search = new Search(admin.options, model, fields, req.query);

        search.execute(function(err){
            if (err) return next(err);

            res.render('list', {
                search: search,
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
