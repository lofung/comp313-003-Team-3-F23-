
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

router.get('/v1/getall', checkAuthenticated, checkAdmin, async function(req, res, next) {
  try {
    const tempAllUsers = await userModel.find({}).sort({ name: 'asc' })
    const allUsersOut = JSON.parse(JSON.stringify(tempAllUsers))
    const allUsersWithoutHashed = allUsersOut.map(({ hashed, ...rest }) => rest) // do not return hashed password
    res.json(allUsersWithoutHashed)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

/* secured API for one user */
router.get('/v1/getone/:id', checkAuthenticated, checkAdmin, async function(req, res, next) {
  try {
    const id = req.params.id
    const tempUser = await userModel.find({id})
    const allUsers = JSON.parse(JSON.stringify(tempUser))
    const allUsersWithoutHashed = allUsers.map(({ hashed, ...rest }) => rest) // do not return hashed password
    res.json(allUsersWithoutHashed)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Internal Server Error' })
  }

});

/* secured API for edit user */
router.put('/v1/edituser/:id', checkAuthenticated, checkAdmin, async function(req, res, next) {
  try {
    const id = req.params.id
    const role = req.query.role
    const active = req.query.activeStatus
    console.log({id, role, active})
    try {
      let tempUser = await userModel.findOneAndUpdate(
        {id}, //search for id
        {role, active}, //update these
        {returnOriginal: true}
        )
          
        res.redirect(303, '/closed/people')
      } catch (e){
        console.error(e)
      }  
    
  

  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}) 


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
  

//check if you are admin
function checkAdmin(req, res, next) {
  if (req.user.role == "admin") {
    console.log("admin logged in, you may go")
    return next()
  }
  console.log("not admin, you may not go")
  res.render('homepage_open', { title: 'Homepage', user: req.user, error_message:"You are not an admin. You may not access restricted page."});
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.locals.message = req.message
  res.redirect('/closed/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/closed/')
  }
  return next()
}


module.exports = router;
/* */