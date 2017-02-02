# Warning
This module is not mature and is not actively developed nor maintained anymore. Usage is not recommended.
Check http://www.forestadmin.com/ for an instant, powerful and fully configurable admin interface.

# mongoose-manager

A generic admin interface for node.js applications that use mongoose.

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
var options = {
    secret: 'a secret string to use for cookie encryption' // replace this by a specific string for your app
};
var admin = new Admin(models, options);

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
