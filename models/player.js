var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var playerSchema = new Schema({
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true, required: true },
    displayName: { type: String, trim: true },
    position: { type: String, trim: true, enum: ['QB', 'WR', 'RB', 'TE', 'DST'], required: true },
    // TODO: Add a team enum
    team: {type: String, trim: true, required: true }
});

playerSchema.pre('save', function(next) {
    this.displayName = (this.position === 'DST') ?
        this.firstName || this.lastName :
        this.displayName = this.firstName + ' ' + this.lastName;

    next();
});

var Player = mongoose.model('Player', playerSchema);

module.exports = Player;