var express = require('express');
var router = express.Router();

var passportConf = require('../config/passport');

var Week = require('../models/week.js');

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
    // We don't populate player data when only asked for the week data, since the client
    // may not actually want it. We'll not send stats or anything either.
    Week.findOne({ weekNumber: req.params.weekNumber }, function(err, week) {
        if (err) {
            return res.sendStatus(404);
        }

        week.players = undefined;

        res.json(week);
    });
});

router.post('/', function(req, res) {
    Week.findOne({ weekNumber: req.body.weekNumber }, function(err, week) {
        if (week) {
            // Already have that week! Should PUT or DELETE it.
            return res.status(400).send('Week already exists');
        }

        var week = new Week();
        week.weekNumber = req.body.weekNumber;
        week.weekLockDate = req.body.weekLockDate;
        week.weekEndDate = req.body.weekEndDate;
        week.state = 'open';

        var today = new Date();

        if (week.lockDate < today) {
            return res.status(400).send('Lock date cannot be before today');
        }

        if (week.weekEndDate < week.weekLockDate) {
            return res.status(400).send('End date cannot be before lock date');
        }
        
        week.save(function(err) {
            if (err) {
                return res.status(400).send('Error saving week data');
            }

            res.json(week);
        });
    });
});

router.put('/:weekNumber', function(req, res) {
    Week.findOne({ weekNumber: req.body.weekNumber }, function(err, week) {
        if (err) {
            return res.sendStatus(404);
        }

        week.weekNumber = req.body.weekNumber;
        week.weekLockDate = req.body.weekLockDate;
        week.weekEndDate = req.body.weekEndDate;
        week.state   = req.body.state || week.state;

        var today = new Date();

        if (week.lockDate < today) {
            return res.status(400).send('Lock date cannot be before today');
        }

        if (week.weekEndDate < week.weekLockDate) {
            return res.status(400).send('End date cannot be before lock date');
        }

        week.save(function(err) {
            if (err) {
                return res.sendStatus(500);
            }

            res.json(week);
        });
    });
});

router.delete('/', function(req, res) {
    Week.find().remove(function(err) {
        if (err) {
            return res.sendStatus(500);
        }

        return res.sendStatus(200);
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
    // Since they're asing for the players, populate all player data for this week
    Week.findOne({ weekNumber: req.params.weekNumber })
        .populate('players.player')
        .exec(function(err, week) {
        if (err) {
            return res.sendStatus(404);
        }

        // We only include the stats for each player in the response if they asked for it.
        // The stats are the largest part of the document response.
        if (req.query.stats !== 'true') {
            for (var i = 0; i < week.players.length; i++) {
                week.players[i].stats = undefined;
            }
        }

        res.json(week);
    });
});

router.delete('/:weekNumber/players', function(req, res) {
    Week.findOne({ weekNumber: req.params.weekNumber }, function(err, week) {
        if (err) { 
            return res.sendStatus(404);
        }

        week.players = [];

        week.save(function(err) {
            if (err) {
                return res.sendStatus(500);
            }

            res.json(week);
        });
    });
});

router.get('/:weekNumber/players/:playerid', function(req, res) {
    Week.findOne({ weekNumber: req.params.weekNumber })
        .populate('players.player')
        .exec(function(err, week) {
        if (err) {
            return res.sendStatus(404);
        }

        // Find the player and return just that object.
        // TODO: Refactor out code to find a player in a given week
        for (var i = 0; i < week.players.length; i++) {
            var p = week.players[i];
            if (p.player.id === req.params.playerid) {
                return res.json(p);
            }
        }

        res.sendStatus(404)
    });
});

router.delete('/:weekNumber/players/:playerid', function(req, res) {
    Week.findOne({ weekNumber: req.params.weekNumber })
        .populate('players.player')
        .exec(function(err, week) {
        if (err) {
            return res.sendStatus(404);
        }

        for (var i = 0; i < week.players.length; i++) {
            var p = week.players[i];
            if (p.player.id === req.params.playerid) {
                week.players.splice(i, 1);

                return week.save(function(err) {
                    if (err) {
                        return res.sendStatus(500);
                    }

                    res.json(week);
                });
            }
        }
        res.sendStatus(404);
    });
})

router.post('/:weekNumber/players', function(req, res) {
    // TODO: Validate that the posted player doesn't appear to already exist...
    Week.findOne({ weekNumber: req.params.weekNumber }, function(err, week) {
        if (err) {
            return res.sendStatus(404);
        }

        if (!req.body.length) {
            return res.sendStatus(400);
        }

        for (var i = 0; i < req.body.length; i++) {
            var newData = req.body[i];

            var player = {
                player: newData.player,
                salary: newData.salary,
                matchup: newData.matchup,
                scoreOverride: newData.scoreOverride
            };

            week.players.push(player);
        };

        week.save(function(err) {
            if (err) {
                return res.sendStatus(500);
            }

            return res.json(player);
        });
    }); 
});

router.put('/:weekNumber/players', function(req, res) {
    Week.findOne({ weekNumber: req.params.weekNumber }, function(err, week) {
        if (err) {
            return res.sendStatus(404);
        }

        // TODO: Validate input

        week.weekNumber = req.body.weekNumber;
        week.weekLockDate = req.body.weekLockDate;
        week.weekEndDate = req.body.weekEndDate;
        week.players = req.body.players;

        week.save(function(err) {
            if (err) {
                return res.sendStatus(500);
            }

            res.json(week);
        });
    });
});

module.exports = router;