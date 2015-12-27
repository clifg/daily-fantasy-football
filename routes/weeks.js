var express = require('express');
var router = express.Router();

var passportConf = require('../config/passport');

var Week = require('../models/week.js');
var Player = require('../models/player.js');

// TODO: protect these APIs

router.get('/', function(req, res) {
    Week.find({}, null, {sort: {weekNumber: 1}}, function(err, weeks) {
        if (err) {
            return res.sendStatus(404);
        }

        res.json(weeks);
    });
});

router.get('/:weekNumber', function(req, res) {
    Week.findOne({ weekNumber: req.params.weekNumber }, function(err, week) {
        if (err) {
            return res.sendStatus(404);
        }

        res.json(week);
    });
});

router.post('/', function(req, res) {
    Week.findOne({ weekNumber: req.body.weekNumber }, function(err, week) {
        if (week) {
            // Already have that week! Should PUT or DELETE it.
            return res.sendStatus(400);
        }

        var week = new Week();
        week.weekNumber = req.body.weekNumber;
        
        week.save(function(err) {
            if (err) {
                return res.sendStatus(400);
            }

            res.json(week);
        });
    });
});

router.delete('/:weekNumber', function(req, res) {
    Week.findOne({ weekNumber: req.params.weekNumber }, function(err, week) {
        if (err) {
            return res.sendStatus(404);
        }

        week.remove(function(err) {
            if (err) throw err;
            res.json(week);
        });
    });
});

router.get('/:weekNumber/players', function(req, res) {
    Player.find( { weekNumber: req.params.weekNumber }, function(err, players) {
        if (err) {
            return res.sendStatus(404);
        }

        res.json(players);
    });
});

router.post('/:weekNumber/players', function(req, res) {
    // TODO: Validate that the posted player doesn't appear to already exist...
    var player = new Player();
    player.weekNumber = req.params.weekNumber;
    player.name = req.body.name;
    player.position = req.body.position;
    player.team = req.body.team;
    player.salary = req.body.salary;

    player.save(function(err) {
        if (err) {
            // TODO: validate the input and send useful errors back
            return res.sendStatus(400);
        };

        res.json(player);
    });
});

router.delete('/:weekNumber/players', function(req, res) {
    Player.find( { weekNumber: req.params.weekNumber } ).remove(function(err) {
        if (err) {
            return res.sendStatus(500);
        }

        res.sendStatus(200);
    });
});

// TODO: weekNumber isn't actually important here. Should consider moving players to a 
// top-level resource instead, since we're already filtering by weekNumber all the time
// anyway.
router.delete('/:weekNumber/players/:playerId', function(req, res) {
    Player.findById(req.params.playerId, function(err, player) {
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