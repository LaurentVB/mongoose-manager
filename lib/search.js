var async = require('async'),
    utils = require('./utils'),
    _ = require('underscore');

function Search(admin, model, fields, criteria){
    this.admin = admin;
    this.options = admin.options;
    this.criteria = criteria;
    this.model = model;
    this.fields = fields;
    this.errors = {};

    // will be populated later on
    this.documents = null;
    this.count = null;
}

Search.prototype.execute = function(cb){
    var where = {},
        model = this.model;

    if (this.criteria.where){
        try {
            where = JSON.parse(this.criteria.where);
        } catch(e) {
            this.errors.where = 'Could not parse where clause. It must be valid JSON.';
            return cb();
        }
    } else if (this.criteria.q){
        // see https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
        var escaped = this.criteria.q.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"),
            re = new RegExp(escaped, 'i'),
            clauses = this.fields.filter(function(fieldName){
                    return utils.isFreeTextSearchable(utils.getField(model, fieldName));
                })
                .map(function(field){
                    var or = {};
                    or[field] = {$regex: re};
                    return or;
                });
        where = {$or: clauses};
    }

    // other search filters (facets)
    this.eachCriteria(function(key, value){
        if (value === utils.EMPTY){
            nullSearch(where, model, key);
        } else {
            where[key] = value;
        }
    }.bind(this));

    async.parallel([
        this.countDocuments.bind(this, where),
        this.findDocuments.bind(this, where)
    ], cb);
};


/**
 * Returns the search clause to use in a search query to find empty/null values for the field.
 *
 * @param where the search criteria
 * @param document the model
 * @param fieldName the name of the field
 * @returns {*}
 */
function nullSearch (where, document, fieldName) {
    var clauses = [null],
        field = utils.getField(document, fieldName);

    if (utils.isArray(field)){
        clauses.push([]);
    } else if (utils.isString(field)){
        clauses.push('');
    }

    clauses =  clauses.map(function(c){
        var o = {};
        o[fieldName] = c;
        return o;
    });

    if (!where.$or){
        where.$or = clauses;
    } else {
        where.$and = [
            {$or: where.$or},
            {$or: clauses}
        ];
        delete where.$or;
    }
}

/**
 * Iterates through valid search criteria and executes the passed callback for each.
 *
 * @param {Function} cb the callback to execute for each search criteria, of the form function(key, value)
 */
Search.prototype.eachCriteria = function(cb){
    this.fields.forEach(function(f){
        if (f in this.criteria){
            cb(f, this.criteria[f]);
        }
    }.bind(this));
};

Search.prototype.countDocuments = function(whereClause, cb){
    this.model.count(whereClause, function(err, count){
        this.count = count;
        cb(err);
    }.bind(this));
};

Search.prototype.findDocuments = function(whereClause, cb){
    var pageSize = this.options.pageSize,
        page = parseInt(this.criteria.page, 10) || 1,
        skip = (page - 1) * pageSize,
        sortField = this.criteria.sortField || '_id',
        sort = {};

    sort[sortField] = this.criteria.sortDir || 1;

    this.model.find(whereClause).limit(pageSize).skip(skip).sort(sort).exec(function(err, documents){
        if (err) return cb(err);

        var getField = utils.getField.bind(null, this.model),
            fieldsToPopulate = this.fields.filter(function(f){
                return utils.isRef(getField(f));
            });

        this.documents = documents;

        this.model.populate(this.documents, fieldsToPopulate, function(err){
            cb(err);
        });
    }.bind(this));
};

Search.prototype.with = function(key, value){
    var criteria = _.clone(this.criteria);
    if (typeof value == 'undefined'){
        delete criteria[key];
    } else {
        criteria[key] = [value];
    }
    return new Search(this.admin, this.model, this.fields, criteria);
};

Search.prototype.without = function(key){
    return this.with(key);
};

Search.prototype.currentSortDir = function(field){
    if (this.criteria.sortField === field){
        return this.criteria.sortDir == 1 ? 'ASC' : 'DESC';
    }
    return '';
};

Search.prototype.toggleSortDir = function(field){
    if (this.criteria.sortField === field){
        return parseInt(this.criteria.sortDir, 10) * -1;
    }
    return 1;
};

Search.prototype.getPage = function(){
    return parseInt(this.criteria.page, 10) || 1;
};

Search.prototype.isPage = function(pageNumber){
    return this.getPage() == pageNumber;
};

Search.prototype.lastPage = function(){
    return Math.floor((this.count - 1) / this.options.pageSize) + 1;
};

Search.prototype.withPage = function(pageNumber){
    if (pageNumber == 'prev') pageNumber = this.getPage() - 1;
    if (pageNumber == 'next') pageNumber = this.getPage() + 1;
    return this.with('page', pageNumber);
};

Search.prototype.calculateFacets = function(cb){
    async.map(this.fields, function(fieldName, next){
        var field = utils.getField(this.model, fieldName);

        if (utils.hasEnum(field)){
            return next(null, {key: fieldName, values: transformInRawDisplayObjects(field.enumValues)});
        }

        if (utils.isBoolean(field)){
            return next(null, {key: fieldName, values: transformInRawDisplayObjects([true, false])});
        }

        this.model.distinct(fieldName, function(err, values){
            if (err) return next(err);

            // populate ref
            if (utils.isRef(field)){
                var ref = field.options.ref;
                this.admin.getModel(ref).where('_id').in(values).exec(function(err, models){
                    next(err, {key: fieldName, values: transformInRawDisplayObjects(models)})
                });
            } else {
                next(null, {key: fieldName, values: transformInRawDisplayObjects(values)});
            }
        }.bind(this));
    }.bind(this), cb);
};

function transformInRawDisplayObjects(values){
    return values.map(function(v){
        var raw = v, display = v;

        if (v && v._id){
            raw = v.id;
        } else if (v instanceof Date){
            raw = v.getTime();
        }

        return {
            raw: raw,
            display: display
        }
    });
}

exports.Search = Search;