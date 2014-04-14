var express = require('express'),
    routes = require('./routes'),
    async = require('async'),
    utils = require('./utils'),
    path = require('path'),
    ejsLocals = require('ejs-locals'),
    _ = require('underscore');

/**
 * Creates an instance of an admin interface which will administrate models.
 *
 * @param models the models to make available in the admin interface
 * @constructor
 */
function Admin(models, options){
    this.models = _asObject(models);
    this.app = this._createApp();
    this.options = _.extend(require('./defaults').defaults, options);
    routes.init(this);
}

Admin.prototype.modelNames = function modelNames(){
    return Object.keys(this.models);
};

Admin.prototype.getModel = function getModel(modelName){
    return this.models[modelName].model;
};

Admin.prototype.getModels = function getModels(){
    return Object.keys(this.models).map(function(key){
        return this.getModel(key);
    }.bind(this));
};

Admin.prototype.getActions = function getActions(modelName){
    var userActions = this.models[modelName].actions || [],
        actions = userActions.concat(this.getDefaultActions());
    return  actions;
};

Admin.prototype.getAction = function getAction(modelName, actionName){
    var actions = this.getActions(modelName);
    return _.find(actions, function(action){
        return action.action == actionName;
    });
};

Admin.prototype.getDefaultActions = function(){
    return [
        {
            action: 'remove',
            fn: deleteModels.bind(this),
            btnClass: 'btn-danger'
        }
    ];
};

Admin.prototype.getListFields = function getListFields(modelName){
    if (this.models[modelName].fields){
        return this.models[modelName].fields;
    }
    return this.getFields(modelName, this.options.numberOfFieldsInListView);
};

Admin.prototype.getFields = function getFields(modelName, limit){

    var paths = this.models[modelName].model.schema.paths,
       virtuals = this.models[modelName].model.schema.virtuals;

    var fields = Object.keys(paths).map(function(k){
            return paths[k].path;
        }).filter(utils.isNotTechnical);

    fields = fields.concat(Object.keys(virtuals).map(function(k){
            return virtuals[k].path;
        }).filter(function(p){
            return p != 'id';
        }));

    if (limit) {
        fields = fields.slice(0, Math.min(limit, fields.length));
    }
    return fields;
};

Admin.prototype.getFacets = function(modelName){
    var model = this.getModel(modelName);
    return this.getListFields(modelName).filter(utils.isNotVirtual.bind(null, model)).filter(utils.isNotTechnical);
};

Admin.prototype._createApp = function() {
    var app = express();

    // all environments
    app.engine('html', ejsLocals);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/../views');

    app.use(express.favicon());
    app.use(express.static(__dirname + '/../public', {'maxAge': 0}));
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('benki-admin-cookie-secret'));
    app.use(express.session());
    app.use(require('../views/helpers').init(this));
    app.use(app.router);

    _.extend(require('ejs').filters, require('../views/filters'));

    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

    return app;
};

function _asObject(models){
    var modelsByName = {};
    models.forEach(function(model){
        if (model.constructor != Object){
            model = {model: model};
        }
        model.name = model.model.modelName;
        modelsByName[model.name] = model;
    });
    return modelsByName;
}

function deleteModels (req, res, next){
    var model = this.getModel(req.params.model);

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

exports.Admin = Admin;