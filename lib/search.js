function Search(options, model, fields, criteria){
    this.options = options;
    this.criteria = criteria;
    this.model = model;
    this.fields = fields;
    this.errors = {};

    // will be populated later on
    this.documents = null;
    this.count = null;
}

Search.prototype.execute = function(cb){
    var q = this.criteria.q,
        where = this.criteria.where;

    try {
        var parsed = JSON.parse(where || '{}');
    } catch(e) {
        this.errors.where = 'Could not parse where clause. It must be valid JSON.';
        return cb();
    }

    async.parallel([
        this.countDocuments.bind(this, parsed),
        this.findDocuments.bind(this, parsed)
    ], cb);
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
        skip = this.criteria.skip = (page - 1) * pageSize,
        sortField = this.criteria.sortField || '_id',
        sortDir = this.criteria.sortDir || 1,
        sort = {};

    sort[sortField] = sortDir;

    this.model.find(whereClause).limit(pageSize).skip(skip).sort(sort).exec(function(err, documents){
        if (err) return cb(err);

        var getField = utils.getField.bind(null, this.model),
            fieldsToPopulate = this.fields.filter(function(f){
                var field = getField(f);
                return field.options && 'ref' in field.options;
            });

        this.documents = documents;

        this.model.populate(this.documents, fieldsToPopulate, function(err){
            cb(err);
        });
    }.bind(this));
};

Search.prototype.with = function(key, value){
    var criteria = _.clone(this.criteria);
    if (value){
        criteria[key] = [value];
    } else {
        delete criteria[key];
    }
    return new Search(this.options, this.model, this.fields, criteria);
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

exports.Search = Search;