
// installed 3rd party packages
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const dotenv = require('dotenv')
const methodOverride = require('method-override')


let indexRouter = require('./routes/index');
let adminRouter = require('./routes/admin');

let usersRouter = require('./routes/users');
let bookRouter = require('./routes/book');
let openRouter = require('./routes/open');


let app = express();

mongoose.connect("mongodb+srv://" + process.env.mongodbuser + ":" + process.env.mongodbpassword + "@dronelibrarycluster0.qkn9o64.mongodb.net/DroneLibraryDB?retryWrites=true&w=majority", {
  useNewUrlParser: true, 
  useUnifiedTopology: true
}, (err) => {
  if(err){
    console.error(err)
  } else {
    console.log("----mongoDB successfully connected.----")
    
  }
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // express  -e

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method'))

// passport related
//app.use(express.cookieParser('secret'));
//app.use(express.cookieSession());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);

app.use('/users', usersRouter);
app.use('/books', bookRouter);
app.use('/', openRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { title: 'Error'});
});

module.exports = app;
