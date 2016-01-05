var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var weekSchema = new Schema({
    state: { type: String, required: true, enum: ['open', 'locked', 'completed', 'closed'] },
    weekNumber: { type: Number, min: 1, max: 22, required: true},
    weekLockDate: { type: Date, required: true},
    weekEndDate: { type: Date, required: true},

    players: [{
        player: { type: Schema.Types.ObjectId, ref: 'Player' },
        salary: { type: Number, min: 0, required: true },
        matchup: { type: String, trim: true, required: true },
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
    }]
});

var Week = mongoose.model('Week', weekSchema);

module.exports = Week;