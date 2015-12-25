var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var playerSchema = new Schema({
    position: { type: String, trim: true, enum: ['QB', 'WR', 'RB', 'TE', 'DST'] },
    name: { type: String, trim: true },
    salary: { type: Number, min: 0 },
    team: {type: String, trim: true },
    avgPoints: { type: Number, min: 0 },
    game: {
        matchup: { type: String, trim: true },
        start: Date
    }
});

var weekSchema = new Schema({
    weekNumber: { type: Number, min: 1, max: 22 },
    weekStart: Date,

    players: [playerSchema]
});

var Week = mongoose.model('Week', weekSchema);

module.exports = Week;