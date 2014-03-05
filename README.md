# mongoose-manager

A generic admin interface for node.js applications that use mongoose.
Warning: Development still in progress.

## Usage

```js
var Admin = require('mongoose-manager').Admin;
var models = [
    {
        model: require('./models/Artist').Artist,
        label: function(artist){ return artist.name }
    },
    require('./models/Label').Label,
    require('./models/Record').Record
];
var admin = new Admin(models);

// an express app is now available in admin.app
admin.app.listen(8080, function(){
    console.log('Example app running on %s', 8080);
});
```

### Note
Thanks to @madhums for handing over the module name