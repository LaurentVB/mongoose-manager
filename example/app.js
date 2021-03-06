var Admin = require('../lib/admin').Admin,
    express = require('express'),
    mongoose = require('mongoose'),
    pluralize = require('pluralize'),
    async = require('async');

mongoose.connect('mongodb://localhost:27017/admin-example');

var Artist = require('./models/Artist').Artist;

var models = [
    {
        model: Artist,
        // the name of the property to be used as label when an Artist is displayed embedded in another document
        label: 'name',
        actions: [
            {
                action: 'Toggle grammy',
                fn: toggleGrammy,
                btnIcon: 'glyphicon-thumbs-up'
            }
        ]
    },
    {
        model: require('./models/Label').Label,
        fields: [
            'name',
            'creationDate'
        ]
    },
    require('./models/Record').Record
];

function toggleGrammy(req, res, next){
    var ids = req.body.ids;
    Artist.find().where('_id').in(ids).exec(function(err, artists){
        async.each(artists, function(artist, cb){
            artist.wonGrammy = !artist.wonGrammy;
            artist.save(cb);
        }, function(err){
            if (err) return err;

            req.flash('notification', {
                level: 'success',
                text: 'Toggled grammy of ' + pluralize('artist', artists.length, true)
            });

            next();
        });
    });
}

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