var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var entrySchema = new Schema({
    contest: { type: Schema.Types.ObjectId, ref: 'Contest', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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