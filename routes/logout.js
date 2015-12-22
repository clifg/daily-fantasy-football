var express = require('express');
var router = express.Router();

/* GET logout page. Doesn't actually render a page -- just logs the user out and redirects to home. */
router.get('/', function(req, res) {
    req.logout();
    req.flash('info', { msg: 'Logged out!'});
    res.redirect('/');
});

module.exports = router;
