var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    facebookId: String,
    facebookToken: String,

    profile: {
        name: String,
        picture: String,
        email: { type: String, lowercase: true }
    },

    isAdmin: Boolean
});

var User = mongoose.model('User', userSchema);

module.exports = User;