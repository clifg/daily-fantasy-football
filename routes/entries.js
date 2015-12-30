var express = require('express');
var router = express.Router();

var passportConf = require('../config/passport');

var Week = require('../models/week');
var Contest = require('../models/contest');
var Entry = require('../models/entry');

// TODO: protect these APIs

router.get('/', function(req, res) {
    Entry.find()
        .populate('user', 'profile')
        .populate('contest')
        .populate('roster')
        .exec(function(err, entries) {
        if (err) {
            return res.sendStatus(404);
        }
        Entry.populate(entries, {
            path: 'contest.week',
            select: '-players',
            model: 'Week'
        }, function(err, entries) {
            if (err) {
                return res.sendStatus(404);
            }

            res.json(entries);
        });
    });
});

router.get('/:id', function(req, res) {
    Entry.findById(req.params.id)
        .populate('user', 'profile')
        .populate('contest')
        .populate('roster')
        .exec(function(err, entry) {
        if (err || (entry == null)) {
            return res.sendStatus(404);
        }

        res.json(entry);
    });
});

router.post('/', function(req, res) {
    var entry = new Entry();
    entry.contest = req.body.contest;
    entry.user = req.body.user;
    entry.roster = req.body.roster;

    // TODO: Validate that the contest, user, and player references (in the roster) are all valid

    entry.save(function(err, entry) {
        if (err) {
            return res.sendStats(400);
        }
        
        res.json(entry);
    });
});

router.put('/:id', function(req, res) {
    Entry.findById(req.params.id, function(err, entry) {
        if (err || (entry == null)) {
            return res.sendStatus(404);
        }

        entry.contest = req.body.contest || entry.contest;
        entry.user = req.body.user || entry.user;
        entry.roster = req.body.roster || entry.roster;

        entry.save(function(err, entry) {
            if (err) {
                return res.sendStatus(400);
            }

            res.json(entry);
        });
    });
});

router.delete('/', function(req, res) {
    Entry.find().remove(function(err) {
        if (err) {
            return res.sendStatus(500);
        }

        return res.sendStatus(200);
    });
});

router.delete('/:id', function(req, res) {
    console.log('deleting id: ' + req.params.id);
    Entry.findById(req.params.id, function(err, entry) {
        if (err) {
            return res.sendStatus(404);
        }

        entry.remove(function(err) {
            if (err) throw err;

            res.sendStatus(200);
        });
    });
});

module.exports = router;