var express = require('express');
var router = express.Router();

var passportConf = require('../config/passport');

var Week = require('../models/week.js');
var Player = require('../models/player.js');

// TODO: protect these APIs

router.get('/', function(req, res) {
    // The request contains query parameters for finding a particular player
    var queryFilter = {};

    // These regex filters are not very efficient, but there is a reasonable limit
    // on the number of NFL players in our pool, so it'll be plenty fast. If it were
    // to become a problem, we can either force names to lower-case, or keep new fields
    // of lower-case versions.
    if (req.query.firstName) {
        queryFilter.firstName = { $regex: new RegExp(req.query.firstName, 'i') };
    }

    if (req.query.lastName) {
        queryFilter.lastName = { $regex: new RegExp(req.query.lastName, 'i') };
    }

    if (req.query.position) {
        queryFilter.position = { $regex: new RegExp(req.query.position, 'i') };
    }

    if (req.query.team) {
        queryFilter.team = { $regex: new RegExp(req.query.team, 'i') };
    }
        
    Player.find(queryFilter, function(err, players) {
        if (err) {
            return res.sendStatus(404);
        }

        res.json(players);
    });
});

router.post('/', function(req,res) {
    var player = new Player();
    player.firstName = req.body.firstName;
    player.lastName = req.body.lastName;
    player.position = req.body.position;
    player.team = req.body.team;

    player.save(function(err) {
        if (err) {
            return res.status(400).send('Error saving player data');
        }

        res.json(player);
    });
});

router.delete('/', function(req, res) {
    Player.find().remove(function(err) {
        if (err) {
            return res.sendStatus(500);
        }

        return res.sendStatus(200);
    });
});

router.get('/:id', function(req, res) {
    Player.findById(req.params.id, function(err, player) {
        if (err) {
            return res.sendStatus(404);
        }

        res.json(player);
    });
});

router.put('/:id', function(req, res) {
    Player.findById(req.params.id, function(err, player) {
        if (err) {
            return res.sendStatus(404);
        }

        player.firstName = req.body.firstName || player.firstName;
        player.lastName = req.body.lastName || player.lastName;
        player.position = req.body.position || player.position;
        player.team = req.body.team || player.team;

        player.save(function(err) {
            if (err) {
                return res.sendStatus(400);
            }

            res.json(player);
        });
    });
});

router.delete('/:id', function(req, res) {
    Player.findById(req.params.id, function(err, player) {
        if (err) {
            return res.sendStatus(404);
        }

        player.remove(function(err) {
            if (err) {
                return res.sendStatus(500);
            }

            res.json(player);
        });
    });
});

module.exports = router;