var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var playerSchema = new Schema({
    weekNumber: { type: Number, min: 1, max: 22, required: true},
    position: { type: String, trim: true, enum: ['QB', 'WR', 'RB', 'TE', 'DST'], required: true },
    name: { type: String, trim: true, required: true },
    salary: { type: Number, min: 0, required: true },
    team: {type: String, trim: true, required: true },
    avgPoints: { type: Number, min: 0 },
    game: {
        matchup: { type: String, trim: true, required: true },
        start: { type: Date, required: true }
    },
    stats: {
        // Offense
        passingYards: { type: Number, default: 0 },
        passingTouchdowns: { type: Number, default: 0 },
        interceptions: { type: Number, default: 0 },
        rushingYards: { type: Number, default: 0 },
        rushingTouchdowns: { type: Number, default: 0 },
        receptions: { type: Number, default: 0 },
        receptionYards: { type: Number, default: 0 },
        receptionTouchdowns: { type: Number, default: 0 },
        returnTouchdowns: { type: Number, default: 0 },
        twoPointConversions: { type: Number, default: 0 },
        fumblesLost: { type: Number, default: 0 },
        offensiveFumbleReturnTouchdowns: { type: Number, default: 0 },

        // Defense / Special Teams
        sacks: { type: Number, default: 0 },
        interceptions: { type: Number, default: 0 },
        fumbleRecoveries: { type: Number, default: 0 },
        defensiveReturnTouchdowns: { type: Number, default: 0 },
        safeties: { type: Number, default: 0 },
        blockedKicks: { type: Number, default: 0 },
        kickReturnTouchdowns: { type: Number, default: 0 },
        extraPointReturns: { type: Number, default: 0 }
    },
    scoreOverride: Number
});

var Player = mongoose.model('Player', playerSchema);

module.exports = Player;