var express = require('express');
var router = express.Router();

var passportConf = require('../config/passport');

var Week = require('../models/week.js');

// TODO: protect these APIs

router.get('/', function(req, res) {
    Week.find({}, function(err, weeks) {
        if (err) throw err;
        res.json(weeks);
    });
});

router.get('/:weekNumber', function(req, res) {
    Week.find({ weekNumber: req.params.weekNumber }, function(err, week) {
        if (err) {
            return res.sendStatus(404);
        }

        return res.json(week);
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
            if (err) throw err;

            return res.json(week);
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
            return res.json(week);
        });
    });
});

module.exports = router;