var express = require('express'),
    routes = require('./routes'),
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
    return this.models[modelName].actions || [];
};

Admin.prototype.getListFields = function getListFields(modelName){
    if (this.models[modelName].fields){
        return this.models[modelName].fields;
    }
    return this.getFields(modelName, this.options.numberOfFieldsInListView);
};

Admin.prototype.getFields = function getFields(modelName, limit){
    var fields = _.values(this.models[modelName].model.schema.paths);
    fields = fields.map(function(field){
        return field.path;
    });
    fields = _.without(fields, '_id', '__v');
    if (limit) {
        fields = fields.slice(0, Math.min(limit, fields.length));
    }
    return fields;
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
    app.use(function(req, res, next){
        res.locals.errors = {};
        next();
    });
    app.use(require('../views/helpers').init(this));
    app.use(app.router);

    _.extend(require('ejs').filters, require('../views/filters'));

    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

    return app;
}

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

exports.Admin = Admin;