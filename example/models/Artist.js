var mongoose = require('mongoose');

var ArtistSchema = new mongoose.Schema({
    name: {type: String, required: true},
    birthDate: {type: Date, required: true},
    deathDate: {type: Date},
    wonGrammy: Boolean,
    label : { type: mongoose.Schema.Types.ObjectId, ref: 'Label' }
});

var Artist = mongoose.model('Artist', ArtistSchema);
exports.Artist = Artist;
