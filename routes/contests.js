var express = require('express');
var router = express.Router();
var async = require('async');

var passportConf = require('../config/passport');

var Week = require('../models/week');
var Contest = require('../models/contest');
var Entry = require('../models/entry');

router.get('/', passportConf.isAuthenticated, function(req, res) {
    // We do a lean get because we won't be re-saving the model and we want to much with the json
    Contest.find()
        .lean()
        .populate('owner', 'profile')
        .populate('week', '-players')
        .exec(function(err, contests) {
        if (err) {
            return res.sendStatus(404);
        }

        // Now grab the entries that reference this contest and stick them in the contest object.
        async.each(contests, function(contest, callback) {
            // We need to use "_id" because these are lean json objects, not mongoose models!
            Entry.find({ contest: contest._id })
                .populate('user', 'profile')
                .populate(req.query.roster === 'true' ? 'roster' : '')
                .select(req.query.roster === 'true' ? '' : '-roster')
                .exec(function(err, entries) {
                if (err) {
                    return callback(err);
                }

                contest.entries = entries;
                return callback();
            });
        }, function(err) {
            if (err) {
                return res.sendStatus(500);
            }

            res.json(contests);
        });
    });
});

router.post('/', passportConf.isAuthenticated, function(req, res) {
    var contest = new Contest();
    contest.owner = req.body.owner;
    contest.week = req.body.week;
    contest.title = req.body.title;
    contest.password = req.body.password;
    contest.salaryCap = req.body.salaryCap;
    contest.positionCounts = req.body.positionCounts;
    contest.qbFlex = req.body.qbFlex;
    contest.wrFlex = req.body.rbFlex;
    contest.rbFlex = req.body.wrFlex;
    contest.teFlex = req.body.teFlex;

    contest.save(function(err, contest) {
        if (err) {
            return res.sendStatus(400);
        }

        return res.json(contest);
    });
});

router.put('/:id', passportConf.isAuthenticated, function(req, res) {
    Contest.findById(req.params.id, function(err, contest) {
        if (err || (contest == null)) {
            return res.sendStatus(404);
        }

        if ((!req.user.id === contest.owner) && !(req.user.admin))
        {
            return res.sendStatus(401);
        }

        contest.owner = req.body.owner || contest.owner;
        contest.week = req.body.week || contest.week;
        contest.title = req.body.title || contest.title;
        contest.password = req.body.password || contest.password;
        contest.salaryCap = req.body.salaryCap || contest.salaryCap;
        contest.positionCounts = req.body.positionCounts || contest.positionCounts;
        contest.qbFlex = typeof req.body.qbFlex !== 'undefined' ? req.body.qbFlex : contest.qbFlex;
        contest.wrFlex = typeof req.body.wrFlex !== 'undefined' ? req.body.rbFlex : contest.wrFlex;
        contest.rbFlex = typeof req.body.rbFlex !== 'undefined' ? req.body.wrFlex : contest.rbFlex;
        contest.teFlex = typeof req.body.teFlex !== 'undefined' ? req.body.teFlex : contest.teFlex;

        contest.save(function(err, contest) {
            if (err) {
                return res.sendStatus(400);
            }

            return res.json(contest);
        });
    });
});

router.get('/:id', passportConf.isAuthenticated, function(req, res) {
    // We do a lean get because we'll be mucking with the json
    Contest.findById(req.params.id)
        .lean()
        .populate('owner', 'profile')
        .populate('week', '-players')
        .exec(function(err, contest) {
        if (err || (contest == null)) {
            return res.sendStatus(404);
        }

        // TODO: Don't send data about other users' rosters before the lock date.
        Entry.find({ contest: contest._id })
            .lean()
            .populate('user', 'profile')
            .populate('roster.player')
            .exec(function(err, entries) {
            if (err) { 
                return res.sendStatus(500);
            }

            contest.entries = entries;

            // Build up a list of every player in every entry, so we know who to look up for stats
            // and score overrides.
            var scoreOverrides = {};
            for (var i = 0; i < entries.length; i++) {
                for (var j = 0; j < entries[i].roster.length; j++) {
                    scoreOverrides[entries[i]._id + entries[i].roster[j].player._id] = {
                        rosterEntry: entries[i].roster[j]
                    };
                }
            }

            Week.findOne({ weekNumber: contest.week.weekNumber })
                .lean()
                .populate('players.player')
                .exec(function(err, week) {
                if (err) {
                    return res.sendStatus(500);
                }

                for (var i = 0; i < week.players.length; i++) {
                    for (var overrideId in scoreOverrides) {
                        if (scoreOverrides[overrideId].rosterEntry.player._id.toString() === week.players[i].player._id.toString()) {
                            scoreOverrides[overrideId].rosterEntry.scoreOverride = week.players[i].scoreOverride;
                        }
                    }
                }

                res.json(contest);
            });
        });
    });
});

router.delete('/', passportConf.isAdmin, function(req, res) {
    Contest.find().remove(function(err) {
        if (err) {
            return res.sendStatus(500);
        }

        Entry.find().remove(function(err) {
            if (err) {
                return res.sendStatus(500);
            }

            return res.sendStatus(200);
        })
    });
});

router.delete('/:id', passportConf.isAuthenticated, function(req, res) {
    Contest.findById(req.params.id, function(err, contest) {
        if (err || (contest == null)) {
            return res.sendStatus(404);
        }

        if ((!req.user.id === contest.owner) && !(req.user.admin))
        {
            return res.sendStatus(401);
        }

        contest.remove(function(err) {
            if (err) throw err;

            Entry.find({contest: contest}).remove(function(err) {
                if (err) {
                    return res.sendStatus(500);
                }

                return res.sendStatus(200);
            });
        });
    });
});

module.exports = router;