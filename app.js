var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var mongoose = require('mongoose');
var passport = require('passport');

var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

var index = require('./routes/index');
var login = require('./routes/login');
var users = require('./routes/users');
var weeks = require('./routes/weeks');
var players = require('./routes/players');
var contests = require('./routes/contests');
var entries = require('./routes/entries');

var app = express();

mongoose.connect(secrets.db);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secrets.sessionSecret,
  cookie: { maxAge: 60000, expires: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000)},
  store: new MongoStore({ mongooseConnection: mongoose.connection, autoReconnect: true })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure every page has access to the current user
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

// Client
app.use('/', index);
app.use('/login', function(req, res) {
  res.render('login', { title: 'Login' });
});

// APIs
app.use('/api/v1/login', login);
app.use('/api/v1/users', users);
app.use('/api/v1/weeks', weeks);
app.use('/api/v1/players', players);
app.use('/api/v1/contests', contests);
app.use('/api/v1/entries', entries);

app.get('/api/v1/brand', function (req, res) {
  return res.status(200).send(process.env.DAILYFANTASY_BRAND || 'Daily Fantasy Football');
});

// Authentication with Facebook
// TODO: Should this be moved under /api?
app.get('/auth/facebook', function(req, res, next) {
    if (req.user)
    {
      // User is already logged in. Don't try to auth again.
      req.flash('error', { msg: 'Please log out before trying to log in with Facebook'});
      return res.redirect('/');
    }
    next();
  }, 
  passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login', successRedirect: '/' }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
