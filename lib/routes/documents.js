var utils = require('../utils'),
    _ = require('underscore'),
    async = require('async'),
    Search = require('../search').Search;

exports.init = function(admin){

    admin.app.get('/:model', loadDocuments);
    admin.app.delete('/:model', deleteDocuments);
    admin.app.get('/facets/:model', loadModelFacets);

    function loadDocuments(req, res, next){
        var model = res.locals.model = admin.getModel(req.params.model),
            fields = res.locals.fields = admin.getListFields(req.params.model),
            search = new Search(admin, model, fields, req.query);

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
            if (err) return next(err);

            // in order to honor middleware, each document is loaded and then removed
            async.each(documents, function(document, cb){
                document.remove(function(err){
                    cb(err);
                });
            }, function(err){
                if (err) return next(err);

                res.redirect(utils.url(req, model.modelName));
            });
        });
    }

    function loadModelFacets(req, res, next){
        var model = res.locals.model = admin.getModel(req.params.model),
            fields = admin.getListFields(req.params.model).filter(utils.isNotVirtual.bind(null, model)),
            search = res.locals.search = new Search(admin, model, fields, req.query);

        search.calculateFacets(function(err, facets){
            if (err) return next(err);

            res.render('partials/facets', {
                facets: facets
            });
        });
    }
};
