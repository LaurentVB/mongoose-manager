var mongoose = require('mongoose');

var RecordSchema = new mongoose.Schema({
    name: {type: String, required: true},
    published: {type: Date},
    artist : { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
    songs: [String]
});

var Record = mongoose.model('Record', RecordSchema);
exports.Record = Record;
