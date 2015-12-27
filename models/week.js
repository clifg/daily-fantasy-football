var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var weekSchema = new Schema({
    weekNumber: { type: Number, min: 1, max: 22 },
    weekStart: Date,
    weekLocked: Date,
    weekEnd: Date
});

var Week = mongoose.model('Week', weekSchema);

module.exports = Week;