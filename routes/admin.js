var express = require('express');
var router = express.Router();

var passportConf = require('../config/passport')

/* GET administrator page. */
router.get('/', passportConf.isAdmin, function(req, res, next) {
  res.render('admin', { title: 'Admin' });
});

module.exports = router;
