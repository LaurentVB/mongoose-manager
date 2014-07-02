var routes = require('./routes'),
    async = require('async'),
    utils = require('./utils'),
    path = require('path'),
    pluralize = require('pluralize'),
    _ = require('underscore');

/**
 * Creates an instance of an admin interface which will administrate models.
 *
 * @param models the models to make available in the admin interface
 * @constructor
 */
function Admin(models, options){
    if (!options.secret){
        console.log("No cookie secret set. You should set options.secret for proper cookie encryption.");
    }
    this.models = _asObject(models);
    this.options = _.extend(require('./defaults').defaults, options);
    this.app = this._createApp(this.options);
    this.extraMenus = [];
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
            action: 'edit',
            fn: bulkEdit.bind(this),
            btnIcon: 'glyphicon-edit'
        },
        {
            action: 'remove',
            fn: deleteModels.bind(this),
            btnClass: 'btn-danger',
            btnIcon: 'glyphicon-remove'
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

    var fields = utils.getFields(this.getModel(modelName).schema);

    if (limit) {
        fields = fields.slice(0, Math.min(limit, fields.length));
    }
    return fields;
};

Admin.prototype.getFacets = function(modelName){
    var model = this.getModel(modelName);
    return this.getListFields(modelName).filter(utils.isNotVirtual.bind(null, model)).filter(utils.isNotTechnical);
};

Admin.prototype.extraMenu = function(name, route){
    this.extraMenus.push({name: name, route: route});
};

Admin.prototype._createApp = require('./express');

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

            var length = documents.length;
            req.flash('notification', {
                level: 'success',
                text: 'Succesfully deleted ' + pluralize('document', length, true)
            });

            res.redirect(utils.url(req, model.modelName));
        });
    });
}

function bulkEdit (req, res, next){
    var model = this.getModel(req.params.model);

    model.find().where('_id').in(req.body.ids).exec(function(err, documents){
        if (err) return next(err);

        async.each(documents, function(document, cb){
            document.set(req.body.fields);
            document.save(function(err){
                cb(err);
            });
        }, function(err){
            if (err) return next(err);

            var length = documents.length;
            req.flash('notification', {
                level: 'success',
                text: 'Succesfully updated ' + pluralize('document', length, true)
            });

            res.redirect(utils.url(req, model.modelName));
        });
    });
}

exports.Admin = Admin;