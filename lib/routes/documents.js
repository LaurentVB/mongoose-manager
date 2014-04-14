var utils = require('../utils'),
    _ = require('underscore'),
    async = require('async'),
    Search = require('../search').Search;

exports.init = function(admin){

    admin.app.get('/:model', loadDocuments);
    admin.app.post('/actions/:model', actionOnDocuments);
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

    function actionOnDocuments(req, res, next){
        var action = admin.getAction(req.params.model, req.body.action);

        if (!action) return res.redirect('back');

        action.fn.call(action, req, res, function(err){
            if (err) return next(err);

            res.redirect('back');
        });
    }

    function loadModelFacets(req, res, next){
        var model = res.locals.model = admin.getModel(req.params.model),
            fields = admin.getFacets(req.params.model),
            search = res.locals.search = new Search(admin, model, fields, req.query);

        search.calculateFacets(function(err, facets){
            if (err) return next(err);

            res.render('partials/facets', {
                facets: facets
            });
        });
    }
};
