module.exports = {
    db: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/daily-fantasy-football',

    sessionSecret: process.env.DAILYFANTASY_SESSION_SECRET,

    facebook: {
        // Used by passport
        clientID: process.env.DAILYFANTASY_FACEBOOK_ID,
        clientSecret: process.env.DAILYFANTASY_FACEBOOK_SECRET,
        callbackURL: '/auth/facebook/callback',
        passReqToCallback: true,
        profileFields: ['id', 'email', 'name', 'displayName'],

        // Used by our code
        adminFacebookId: process.env.DAILYFANTASY_ADMIN_FACEBOOK_ID,
    }
}