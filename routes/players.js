var express = require('express');
var router = express.Router();

var passportConf = require('../config/passport');

var Week = require('../models/week.js');
var Player = require('../models/player.js');

// TODO: protect these APIs

router.get('/', function(req, res) {
    Player.find(function(err, players) {
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

        console.log('req firstname: ' + req.body.firstName);
        console.log('player firstname: ' + player.firstName);

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