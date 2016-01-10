var express = require('express');
var router = express.Router();
var async = require('async');

var passportConf = require('../config/passport');

var Week = require('../models/week');
var Contest = require('../models/contest');
var Entry = require('../models/entry');

router.get('/', function(req, res) {
    Week.find({}, null, {sort: {weekNumber: 1}})
        .lean()
        .select(req.query.players !== 'true' 
            ? '-players'
            : req.query.stats !== 'true' 
                ? '-players.stats'
                : '')
        .populate('players.player')
        .exec(function(err, weeks) {
        if (err) {
            return res.sendStatus(404);
        }
        
        if (req.query.contests === 'true') {
            async.each(weeks, function(week, callback) {
                Contest.find({ week: week }, function(err, contests) {
                    if (err) {
                        return callback(err);
                    }

                    week.contests = contests;
                    return callback();
                });
            }, function(err) {
                if (err) {
                    return res.sendStatus(500);
                }

                return res.json(weeks);
            });
        } else {
            return res.json(weeks);
        }
    });
});

router.get('/:weekNumber', function(req, res) {
    // We don't populate player data when only asked for the week data, since the client
    // may not actually want it. We'll not send stats or anything either.
    Week.findOne({ weekNumber: req.params.weekNumber })
        .lean()
        .select(req.query.players === 'true' ? '' : '-players')
        .exec(function(err, week) {
        if (err || (week == null)) {
            return res.sendStatus(404);
        }

        if (req.query.contests === 'true') {
            Contest.find({ week: week })
                .lean()
                .populate('owner', 'profile')
                .exec(function(err, contests) {
                if (err) {
                    return res.sendStatus(500);
                }

                week.contests = contests;

                // Also grab the number of entries for each contest
                async.each(contests, function(contest, callback) {
                    Entry.find({ contest: contest }, function(err, entries) {
                        if (err) {
                            return callback(err);
                        }

                        contest.entryCount = entries.length;
                        return callback();
                    });
                    }, function(err) {
                        if (err) {
                            return res.sendStatus(500);
                        }

                        return res.json(week);
                    }
                );
            });
        } else {
            return res.json(week);
        }
    });
});

router.post('/', passportConf.isAdmin, function(req, res) {
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

router.put('/:weekNumber', passportConf.isAdmin, function(req, res) {
    Week.findOne({ weekNumber: req.body.weekNumber }, function(err, week) {
        if (err || (week == null)) {
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

router.delete('/', passportConf.isAdmin, function(req, res) {
    Week.find().remove(function(err) {
        if (err) {
            return res.sendStatus(500);
        }

        return res.sendStatus(200);
    });
});

router.delete('/:weekNumber', passportConf.isAdmin, function(req, res) {
    Week.findOne({ weekNumber: req.params.weekNumber }, function(err, week) {
        if (err || (week == null)) {
            return res.sendStatus(404);
        }

        week.remove(function(err) {
            if (err) throw err;
            res.sendStatus(200);
        });
    });
});

router.get('/:weekNumber/players', function(req, res) {
    // Since they're asing for the players, populate all player data for this week
    Week.findOne({ weekNumber: req.params.weekNumber })
        .populate('players.player')
        .select(req.query.stats === 'true' ? '' : '-players.stats')
        .exec(function(err, week) {
        if (err) {
            return res.sendStatus(404);
        }

        res.json(week);
    });
});

router.delete('/:weekNumber/players', passportConf.isAdmin, function(req, res) {
    Week.findOne({ weekNumber: req.params.weekNumber }, function(err, week) {
        if (err || (week == null)) { 
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
        if (err || (week == null)) {
            return res.sendStatus(404);
        }

        // Find the player and return just that object.
        // TODO: Refactor out code to find a player in a given week. Or even better,
        // there is probably a way to do this in the findOne call filtering above!
        for (var i = 0; i < week.players.length; i++) {
            var p = week.players[i];
            if (p.player.id === req.params.playerid) {
                return res.json(p);
            }
        }

        res.sendStatus(404)
    });
});

// This is only used for setting the score override.
router.put('/:weekNumber/players/:playerId', passportConf.isAdmin, function(req, res) {
    Week.findOne({ weekNumber: req.params.weekNumber })
        .populate('players.player')
        .exec(function(err, week) {
        if (err || (week == null)) {
            return res.sendStatus(404);
        }

        var foundIndex;

        for (var i = 0; i < week.players.length; i++) {
            if (week.players[i].player.id === req.params.playerId) {
                week.players[i].scoreOverride = req.body.scoreOverride;
                foundIndex = i;
            }
        }

        week.save(function(err) {
            if (err) {
                return res.sendStatus(400);
            }

            return res.json(week.players[foundIndex]);
        });
    });
});

router.delete('/:weekNumber/players/:playerid', passportConf.isAdmin, function(req, res) {
    Week.findOne({ weekNumber: req.params.weekNumber })
        .populate('players.player')
        .exec(function(err, week) {
        if (err || (week == null)) {
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

router.post('/:weekNumber/players', passportConf.isAdmin, function(req, res) {
    // TODO: Validate that the posted player doesn't appear to already exist...
    Week.findOne({ weekNumber: req.params.weekNumber }, function(err, week) {
        if (err || (week == null)) {
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

router.put('/:weekNumber/players', passportConf.isAdmin, function(req, res) {
    Week.findOne({ weekNumber: req.params.weekNumber }, function(err, week) {
        if (err || (week == null)) {
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