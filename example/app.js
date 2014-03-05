var Admin = require('../lib/admin').Admin,
    express = require('express'),
    mongoose = require('mongoose'),
    async = require('async');

mongoose.connect('mongodb://localhost:27017/admin-example');

var models = [
    {
        model: require('./models/Artist').Artist,
        // the name of the property to be used as label when an Artist is displayed embedded in another document
        label: 'name'
    },
    require('./models/Label').Label,
    require('./models/Record').Record
];

var admin = new Admin(models, {
    pageSize: 20
});

// run the admin app
loadFixtures(function(err){
    if (err) return console.error(err);
    console.log('Finished loading fixtures');
    admin.app.listen(8080, function(){
        console.log('Example app running on %s', 8080);
    });
});

function loadFixtures(cb){
    async.each(admin.getModels(), function(model, next){
        model.remove({}, function(err){
            if (err) return next(err);

            var models = require(__dirname + "/fixtures/" + model.modelName + ".json");
            model.create(models, function(err){
                next(err);
            });
        });
    }, cb);
}