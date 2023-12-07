
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}


const bcrypt = require('bcrypt');
const userModel = require('../models/user.js');
var express = require('express');
var router = express.Router();
const flash = require('express-flash')
const mongoose = require("mongoose");
const session = require('express-session')
const passport = require('passport')


const initializePassport = require('../passport-config')
initializePassport(passport)


router.post('/v1/register', async function(req, res, next) {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const date = Date.now().toString()
    const username = req.body.name

    //console.log(`id: ${date}, name: ${username}, hashed: ${hashedPassword}`)
    const new_user = new userModel({id: date, name: username, hashed: hashedPassword})
    await new_user.save(function(err, doc){
      if (err) return console.error(err)
      console.log("user registered successfully!")
    })
    res.redirect('/login')
  } catch (e) {
    console.log('register catch triggered')
    console.error(e);
    res.redirect('/register')
  }
});

router.post('/v1/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), function(req, res) {
  // Check if the username is "admin"
  if (req.user.name == 'admin') {
    return res.redirect('/admin/bookmgmt');
  }

  // For other users, redirect to the default route '/'
  return res.redirect('/');
});

/*
router.post('/v1/login', passport.authenticate('local', {
  successRedirect:'/', 
  failureRedirect:'/login', 
  failureFlash: true
  }))
*/

router.delete('/v1/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});
  
  


module.exports = router;
/* */