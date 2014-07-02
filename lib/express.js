var express = require('express'),
    ejsLocals = require('ejs-locals'),
    ejs = require('ejs'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    cache = {};

/**
 * Express-compatible extension of the ejs-locals view engine that overrides the <code>partial</code> directive
 * with a simpler version.
 * The app, response and partial-specific options/locals are merged, preserving specificity, before they're passed to the
 * partial for rendering.
 *
 * @param path
 * @param options
 * @param callback
 * @returns {*}
 */
function viewEngine(path, options, callback){
    options.partial = partial.bind(options);
    return ejsLocals(path, options, callback);
}

function partial(partialPath, partialOptions){

    var root = path.dirname(this.filename),
        file = path.resolve(root, partialPath);

    if( !file ){
        throw new Error('Could not find partial ' + partialPath);
    }

    // read view
    var key = file + ':string',
        source = partialOptions.cache
            ? cache[key] || (cache[key] = fs.readFileSync(file, 'utf8'))
            : fs.readFileSync(file, 'utf8');

    partialOptions.filename = file;

    var opts = _.extend({}, this, partialOptions);

    return ejs.render(source, opts);
}

module.exports = function(options){
    var app = express();

    // all environments
    app.engine('html', viewEngine);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/../views');

    app.use(express.favicon());
    app.use(express.static(__dirname + '/../public', {'maxAge': 0}));
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser(options.secret || 'mongoose manager cookie secret'));
    app.use(express.session());
    app.use(require('connect-flash')());
    app.use(require('../views/helpers').init(this));
    app.use(app.router);

    _.extend(require('ejs').filters, require('../views/filters'));

    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

    return app;
};