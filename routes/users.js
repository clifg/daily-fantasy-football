var express = require('express');
var router = express.Router();

var secrets = require('../config/secrets');

var User = require('../models/user.js');

router.get('/', function(req, res) {
    User.find({}, function(err, users) {
        if (err) throw err;
        res.json(users);
    });
});

router.get('/:id', function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (err) throw err;

        res.json(user);
    });
});

router.delete('/:id', function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (err) throw err;

        user.remove(function(err) {
            if (err) throw err;

            res.json(user);
        });
    });
});

module.exports = router;