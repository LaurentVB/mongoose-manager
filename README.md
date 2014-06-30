# mongoose-manager

A generic admin interface for node.js applications that use mongoose.
Warning: Development still in progress.

## Usage

### Basic usage

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

### Adding extra menus
You can add your own entries to the index menu:

```js
admin.extraMenu('The menu text', 'http://google.com');
```

### Note
Thanks to @madhums for handing over the module name