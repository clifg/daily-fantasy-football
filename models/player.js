var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var playerSchema = new Schema({
    weekNumber: { type: Number, min: 1, max: 22},
    position: { type: String, trim: true, enum: ['QB', 'WR', 'RB', 'TE', 'DST'] },
    name: { type: String, trim: true },
    salary: { type: Number, min: 0 },
    team: {type: String, trim: true },
    avgPoints: { type: Number, min: 0 },
    game: {
        matchup: { type: String, trim: true },
        start: Date
    },
    stats: {
        // Offense
        passingYards: Number,
        passingTouchdowns: Number,
        interceptions: Number,
        rushingYards: Number,
        rushingTouchdowns: Number,
        receptions: Number,
        receptionYards: Number,
        receptionTouchdowns: Number,
        returnTouchdowns: Number,
        twoPointConversions: Number,
        fumblesLost: Number,
        offensiveFumbleReturnTouchdowns: Number,

        // Defense / Special Teams
        sacks: Number,
        interceptions: Number,
        fumbleRecoveries: Number,
        defensiveReturnTouchdowns: Number,
        safeties: Number,
        blockedKicks: Number,
        kickReturnTouchdowns: Number,
        extraPointReturns: Number
    }
});

var Player = mongoose.model('Player', playerSchema);

module.exports = Player;