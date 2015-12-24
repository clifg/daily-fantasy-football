var express = require('express');
var router = express.Router();

var secrets = require('../config/secrets');
var passportConf = require('../config/passport');

var User = require('../models/user.js');

router.get('/', passportConf.isAdmin, function(req, res) {
    User.find({}, function(err, users) {
        if (err) throw err;
        res.json(users);
    });
});

router.get('/me', passportConf.isAuthenticated, function(req, res) {
    if (!req.user) {
        res.send(404);
    }
    else
    {
        res.json(req.user);
    }
});

router.delete('/me', passportConf.isAuthenticated, function(req, res) {
    if (!req.user) {
        res.sendStatus(404);
    }
    else
    {
        User.findById(req.user.id, function(err, user) {
            if (err) {
                return res.sendStatus(404);
            }

            user.remove(function(err) {
                if (err) throw err;

                res.json(user);
            })
        })
    }
});

router.get('/:id', passportConf.isAuthenticated, function(req, res) {
    if ((req.params.id == req.user.id) || req.user.isAdmin) {
        User.findById(req.params.id, function(err, user) {
            if (err) {
                return res.send(404);
            }

            res.json(user);
        });
    }
    else
    {
        res.send(401);
    }
});

router.delete('/:id', passportConf.isAuthenticated, function(req, res) {
    if ((req.params.id == req.user.id) || req.user.isAdmin) {
        User.findById(req.params.id, function(err, user) {
            if (err) {
                return res.send(404);
            }

            user.remove(function(err) {
                if (err) throw err;

                res.json(user);
            });
        });
    }
    else
    {
        res.send(401);
    }
});

module.exports = router;