var async = require('async');

exports.init = function(admin){

    admin.app.get('/', loadModels);

    function loadModels(req, res, next){
        async.map(admin.modelNames(), function(name, cb){
            admin.getModel(name).count(function(err, count){
                if (err) return cb(err);

                cb(null, {
                    name: name,
                    count: count
                })
            })
        }, function(err, models){
            res.render('index', {
                models : models,
                extraMenus : admin.extraMenus
            })
        })
    }
};
