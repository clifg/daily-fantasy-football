var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var playerSchema = new Schema({
    firstName: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, required: true },
    position: { type: String, trim: true, enum: ['QB', 'WR', 'RB', 'TE', 'DST'], required: true },
    // TODO: Add a team enum
    team: {type: String, trim: true, required: true }
});

var Player = mongoose.model('Player', playerSchema);

module.exports = Player;