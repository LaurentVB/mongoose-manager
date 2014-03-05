var mongoose = require('mongoose');

var LabelSchema = new mongoose.Schema({
    name: {type: String, required: true}
});

var Label = mongoose.model('Label', LabelSchema);
exports.Label = Label;
