var passport = require('passport');
var FacebookStrategy = require('passport-facebook');

var secrets = require('./secrets');

var User = require('../models/user');

passport.serializeUser(function(user, done) {
    console.log('Serializing user id: ' + user.id);
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    console.log('Deserializing user with id: ' + id);
    User.findById(id, function(err, user) {
        done(err, user);
  });
});

passport.use(new FacebookStrategy(secrets.facebook, function(req, accessToken, refreshToken, profile, done) {
    if (req.user) {
        // We already have a logged-in user. Get it and see if it matches what we just auth'd through Facebook.
        User.findById(req.user.id, function(err, user) {
            if (err) { return done(err); }

            if (user.facebookId == profile.id) {
                console.log('Already logged in for authenticated FB user');
                req.flash('info', { msg: 'Already signed in with that Facebook account.' });
                done(null, user);
            } else {
                // The current user doesn't match the auth'd Facebook account. Show the user an error.
                console.log('FB authenticated user does not match logged in user');
                req.flash('error', { msg: 'Already logged in with another account. Log out first to change accounts.' });
                done(err);
            }
        });
    } else {
        User.findOne({ facebookId: profile.id }, function(err, existingUser) {
            if (err) { return done(err); }

            if (existingUser) {
                console.log('passport: logged in existing user... ' + existingUser);
                return done(null, existingUser);
            } else {
                // New user! Create an account in our database
                console.log(profile);
                
                var user = new User();

                user.facebookId = profile.id;
                user.facebookToken = accessToken;
                user.profile.name = profile.displayName;
                user.profile.email = profile._json.email;
                user.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';

                user.isAdmin = (profile.id == secrets.facebook.adminFacebookId);

                user.save(function(err) {
                    if (err) { throw err; }

                    console.log('passport: saved new user... ' + user);
                    return done(null, user);
                });
            }
        });
    }
}));

// TODO: These feel like they should be part of the user, or some other service, not
// the passport config. Consider moving them.
exports.isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.send(401);
};

exports.isAdmin = function(req, res, next) {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    res.send(401);
};