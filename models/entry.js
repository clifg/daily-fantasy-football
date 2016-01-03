var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var entrySchema = new Schema({
    contest: { type: Schema.Types.ObjectId, ref: 'Contest', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // TODO: The fact that salary and matchup are repeated here and in the week is a sign
    // of poor data modeling. This needs to be fixed ASAP.
    roster: [{
        player: { type: Schema.Types.ObjectId, ref: 'Player'},
        salary: { type: Number, min: 0, required: true },
        matchup: { type: String, trim: true, required: true }
    }]
    // TODO: Scores?
});

// TODO: Add validation that roster meets position count criteria of contest

var Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;