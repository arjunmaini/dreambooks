const router = require('express').Router();
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');
const mongoose = require('mongoose');
// Load Story Model
const Story = mongoose.model('stories');

router.get('/', ensureGuest,function (req, res) {
    res.render('index/welcome');
})

router.get('/dashboard', ensureAuthenticated,function (req, res) {
    Story.find({user:req.user.id})
        .then(function (stories) {
            res.render('index/dashboard', {
                stories:stories
            });
        })

})

router.get('/about', function (req, res) {
    res.render('index/about');
});


module.exports = router;