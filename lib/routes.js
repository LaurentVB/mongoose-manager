exports.init = function(admin){
    require('./routes/models').init(admin);
    require('./routes/documents').init(admin);
    require('./routes/document').init(admin);
};

