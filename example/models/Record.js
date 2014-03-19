var mongoose = require('mongoose');

var RecordSchema = new mongoose.Schema({
    name: {type: String, required: true},
    published: {type: Date},
    type: {type: String, enum: ['LP', 'EP', 'Single']},
    artist : { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
    songs: [String]
});

var Record = mongoose.model('Record', RecordSchema);
exports.Record = Record;
