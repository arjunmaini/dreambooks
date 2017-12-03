const router = require('express').Router();
const mongoose = require('mongoose');
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

// Load Story Model
const Story = mongoose.model('stories');
const User = mongoose.model('users');

// Stories Index
router.get('/', function (req, res) {
    Story.find({status:'public'})
        .populate('user')
        .sort({date:'desc'})
        .then(function (stories) {
            res.render('stories/index', {stories:stories});
        })
});

// Show Single Story
router.get('/show/:id',ensureAuthenticated, function (req, res) {
    Story.findOne({
        _id:req.params.id
    })
        .populate('user')
        .populate('comments.commentUser')
        .then(function (story) {
        if(story.status == 'public'){
            res.render('stories/show', {
                story:story
            })
        }else{
            if(req.user){
                if(req.user.id == story.user._id){
                    res.render('stories/show', {
                        story:story
                    })

                }else{
                    res.redirect('/stories');
                }
            }
        }
    })
});

router.get('/edit/:id', function (req, res) {
    Story.findOne({
        _id:req.params.id
    })
        .then(function (story) {

            if(story.user != req.user.id){
                res.redirect('/stories');
            }else{
                res.render('stories/edit', {
                    story:story
                })
            }

        })

})


// List Stories From a specific user
router.get('/user/:userId', function (req, res) {
    Story.find({user:req.params.user_id,status:'public' })
        .populate('user')
        .then(function (stories) {
            res.render('stories/index', {
                stories:stories
            })
        })
})

// Logged in user stories
router.get('/my', ensureAuthenticated, function (req,res) {
    Story.find({user:req.user.id})
        .populate('user')
        .then(function (stories) {
            res.render('stories/index', {
                stories:stories
            })
        })
})



// Add Story Form
router.get('/add', ensureAuthenticated,function (req, res) {
    res.render('stories/add');
});

// Process Add Story
router.post('/', function (req, res) {
    let allowComments;

    if(req.body.allowComments){
        allowComments = true;
    }else{
        allowComments = false;
    }

    const newStory = {
        title:req.body.title,
        body:req.body.body,
        status:req.body.status,
        allowComments:allowComments,
        user:req.user.id
    }

    new Story(newStory)
        .save()
        .then(function (story) {
            res.redirect('/stories/show/' + story.id);
        })
})

// Edit Story Process
router.put('/:id', function (req, res) {
    Story.findOne({
        _id:req.params.id
    })
        .then(function (story) {
            let allowComments;

            if(req.body.allowComments){
                allowComments = true;
            }else{
                allowComments = false;
            }

            // New Values

                story.title = req.body.title,
                story.body = req.body.body,
                story.status = req.body.status,
                story.allowComments = allowComments

            story.save()
                .then(function (story) {
                    res.redirect('/dashboard');
                })


        })
})

// Add Comment
router.post('/comment/:id', function (req, res) {
    Story.findOne({
        _id:req.params.id
    })
        .then(function (story) {
            const newComment = {
                commentBody:req.body.commentBody,
                commentUser:req.user.id
            }

            // Add  to comments Array
            story.comments.unshift(newComment);

            story.save()
                .then(function (story) {
                    res.redirect('/stories/show/' + story.id);
                })
        })
})

// Delete Story
router.delete('/:id', function (req, res) {
    Story.remove({
        _id:req.params.id
    }).then(function () {
        res.redirect('/dashboard');
    })
})

module.exports = router;