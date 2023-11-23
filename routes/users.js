
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
    if (req.query.role == "admin"){
      role = "admin"
    } else {
      role = "user"
    }

    //console.log(`id: ${date}, name: ${username}, hashed: ${hashedPassword}`)
    const new_user = new userModel({id: date, name: username, hashed: hashedPassword, role: role})
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
  successRedirect:'/business', 
  failureRedirect:'/login', 
  failureFlash: true
  }))

router.delete('/v1/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});
  
/* login for closed admin portals*/
router.post('/v1closed/login', passport.authenticate('local', {
  successRedirect:'/closed/business', 
  failureRedirect:'/closed/login', 
  failureFlash: true
  }))

router.delete('/v1closed/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/closed/login');
  });
});
  


module.exports = router;
/* */