var express = require('express');
var router = express.Router();


var News = require('../models/news');
var Service = require('../models/service').Service;
var About = require('../models/service').About;
var ContactUser = require('../models/service').ContactUser;
var SocialMedia = require('../models/service').SocialMedia;




router.get('/allServices', async function (req, res, next) {


    Service.find({type: req.query.type}).exec(function (err, services) {
        if (services) {
            res.json({ success: true, services: services });
        } else {

            res.json({ success: false });
        }
    })
})


router.get('/serviceByTitle', async function (req, res, next) {

    if (!req.query.title) {
        return res.status(400).json({
            success: false
        });
    }
    Service.findOne({ enTitle: req.query.title }).exec(function (err, service) {
        if (service) {
            res.json({ success: true, service: service });
        } else {

            res.json({ success: false });
        }
    })
})

router.get('/loadAbout', async function (req, res, next) {


    About.find().exec(function (err, services) {
        if (services) {
            res.json({ success: true, about: services[0] });
        } else {

            res.json({ success: false });
        }
    })
})



router.get('/contactUsers', async function (req, res, next) {


    ContactUser.find().exec(function (err, contacts) {
        if (contacts) {
            res.json({ success: true, contacts: contacts });
        } else {
            res.json({ success: false });
        }
    })
})



router.get('/socialMedia', async function (req, res, next) {


    SocialMedia.find().exec(function (err, data) {
        if (data) {
            res.json({ success: true, data: data });
        } else {
            res.json({ success: false });
        }
    })
})


module.exports = router;