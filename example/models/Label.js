var mongoose = require('mongoose');

var LabelSchema = new mongoose.Schema({
    name: {type: String, required: true}
});

LabelSchema.virtual('creationDate').get(function () {
    return this._id.getTimestamp();
});

LabelSchema.virtual('virtualAttr').get(function () {
    return true;
});

LabelSchema.virtual('virtualAttr').set(function (value) {
    console.log("Setting virtual attribute to " + value);
});

var Label = mongoose.model('Label', LabelSchema);
exports.Label = Label;
