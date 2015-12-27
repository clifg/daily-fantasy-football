var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var weekSchema = new Schema({
    weekNumber: { type: Number, min: 1, max: 22, required: true},
    weekLockDate: { type: Date, required: true},
    weekEndDate: { type: Date, required: true}
});

var Week = mongoose.model('Week', weekSchema);

module.exports = Week;