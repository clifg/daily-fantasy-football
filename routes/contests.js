var express = require('express');
var router = express.Router();
var async = require('async');

var passportConf = require('../config/passport');

var Week = require('../models/week');
var Contest = require('../models/contest');
var Entry = require('../models/entry');

// TODO: protect these APIs

router.get('/', function(req, res) {
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
                .populate('roster')
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

router.post('/', function(req, res) {
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

router.put('/:id', function(req, res) {
    Contest.findById(req.params.id, function(err, contest) {
        if (err || (contest == null)) {
            return res.sendStatus(404);
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

router.get('/:id', function(req, res) {
    // We do a lean get because we'll be mucking with the json
    Contest.findById(req.params.id)
        .lean()
        .populate('owner', 'profile')
        .populate('week', '-players')
        .exec(function(err, contest) {
        if (err || (contest == null)) {
            return res.sendStatus(404);
        }

        Entry.find({ contest: contest._id })
            .populate('user', 'profile')
            .populate('roster')
            .exec(function(err, entries) {
            if (err) { 
                return res.sendStatus(500);
            }

            contest.entries = entries;

            res.json(contest);
        });
    });
});

router.delete('/', function(req, res) {
    Contest.find().remove(function(err) {
        if (err) {
            return res.sendStatus(500);
        }

        return res.sendStatus(200);
    });
});

router.delete('/:id', function(req, res) {
    Contest.findById(req.params.id, function(err, contest) {
        if (err || (contest == null)) {
            return res.sendStatus(404);
        }

        contest.remove(function(err) {
            if (err) throw err;

            res.sendStatus(200);
        });
    });
});

module.exports = router;