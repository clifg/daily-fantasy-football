var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    facebookId: String,
    facebookToken: String,

    // TODO: Make a publicProfile so we don't expose email address or anything else
    // that may be sensitive to other users.
    profile: {
        name: String,
        picture: String,
        email: { type: String, lowercase: true }
    },

    isAdmin: Boolean
});

var User = mongoose.model('User', userSchema);

module.exports = User;