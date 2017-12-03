const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Load User Model
require('./models/User');
require('./models/Story');

// Passport Config
require('./config/passport')(passport);

// Load Routes
const index = require('./routes/index');
const auth = require('./routes/auth');
const stories = require('./routes/stories');

// Load Keys
const keys = require('./config/keys');

// Handlebar Helpers
const {truncate, stripTags, formatDate, select } = require('./helpers/hbs');

// Map global promises
mongoose.Promise = global.Promise;
// Mongoose Connect
mongoose.connect(keys.mongoURI, {
    useMongoClient:true
})
    .then(function(){console.log('MongoDB Connected')})
.catch(function (err) {
    console.log(err);
});

const app = express();

// Method Override Middleware
app.use(methodOverride('_method'));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Handlebars Middleware
app.engine('handlebars', exphbs({
    helpers:{
        truncate:truncate,
        stripTags:stripTags,
        formatDate:formatDate,
        select:select
    },
    defaultLayout:'main'
}));
app.set('view engine', 'handlebars');

// this stuff always above the auth route as it needs this
app.use(cookieParser());
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global vars
app.use(function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Use Routes
app.use('/', index);
app.use('/auth', auth);
app.use('/stories', stories);

const port = process.env.PORT || 5300;

app.listen(port, function(){
    console.log("Server started on http://localhost:" + port );
});