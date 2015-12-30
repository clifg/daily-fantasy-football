var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contestSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    week: { type: Schema.Types.ObjectId, ref: 'Week', required: true },
    title: { type: String, trim: true, required: true },
    password: { type: String, trim: true },
    salaryCap: { type: Number, default: 50000, required: true },

    positionCounts: {
        QB: { type: Number, default: 1 },
        RB: { type: Number, default: 2 },
        WR: { type: Number, default: 3 },
        TE: { type: Number, default: 1 },
        FLEX: { type: Number, default: 1 },
        DST: { type: Number, default: 1 }
    },

    // We could do this with an array of string enum, but it gets messy and this list will
    // remain manageable, so we'll make our lives a little easier.
    qbFlex: { type: Boolean, default: false },
    wrFlex: { type: Boolean, default: true },
    rbFlex: { type: Boolean, default: true },
    teFlex: { type: Boolean, default: true }

    // TODO: Scoring rules
});

var Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;