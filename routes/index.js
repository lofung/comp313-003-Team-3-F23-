var express = require('express');
var router = express.Router();
const Book = require('../models/book')

/* GET home page. */
router.get('/', function(req, res, next) {
  Book.find().sort({ title: 1 , genre: 1}).exec((err, books) => {
    if (err) {
      res.json({message: err.message});
    } else {
      res.render('homepage', { title: 'BooksOnFly', user: req.user, books: books});      
    }
  });
  
});

router.get('/login', checkNotAuthenticated, function(req, res, next) {
  res.render('login', { title: 'Login', user: req.user});
});

router.get('/register', checkNotAuthenticated, function(req, res, next) {
  res.render('register', { title: 'Register', user: req.user});
});

/* GET feedback page. */
router.get('/feedback', function(req, res, next) {
  res.render('feedback', { title: 'Feedback', user: req.user, success: true});
});



/* GET Borrow page. */
router.get('/borrow', checkAuthenticated, function(req, res, next) {
  res.render('borrow', { title: 'Borrow', user: req.user});
});

/* GET Return page. */
router.get('/return', checkAuthenticated, function(req, res, next) {
  res.render('return', { title: 'Return', user: req.user});
});

/* GET BOOKS index page. */
router.get('/booklist', function(req, res, next) {
  res.render('booklist', { title: 'Book List', user: req.user});
});

router.get('/business', checkAuthenticated, function(req, res, next) {
  res.render('businessViews', { title: 'Business Contacts', user: req.user});
});

router.get('/addbookform', checkAuthenticated, function(req, res, next) {
  res.render('addbookform', { title: 'Add Book Form', user: req.user});
});

router.get('/businessedit/:id', checkAuthenticated, function(req, res, next) {
  res.render('businessEdit', { title: 'Business Contacts Edit', _id: req.params.id, user: req.user});
});

/* GET Services page. */
router.get('/services', function(req, res, next) {
  res.render('services', { title: 'Services', user: req.user});
});

/* GET Contact Us page. */
router.get('/contact', function(req, res, next) {
  res.render('contact', { title: 'Contact', user: req.user});
});

/* secured API for all contacts */
router.get('/businesscontactsid/:id', checkAuthenticated, async function(req, res, next) {
  const _id = req.params.id
  const tempAllContacts = await contactsModel.find({_id})
  const allContacts = JSON.parse(JSON.stringify(tempAllContacts))
  res.json(allContacts)
});

/* secured API for all contacts */
router.get('/allbusinesscontacts', checkAuthenticated, async function(req, res, next) {
  const tempAllContacts = await contactsModel.find({}).sort({name: 'asc'})
  const allContacts = JSON.parse(JSON.stringify(tempAllContacts))
  res.json(allContacts)
});

/* secured API for delete contacts */
router.delete('/deletebusinesscontacts/:id', checkAuthenticated, async function(req, res, next) {
  const _id = req.params.id
  try {
    await contactsModel.deleteOne({_id}, function(err, obj){
      if (err) throw console.error(err)
      console.log(_id + " object from mongo deleted.")
      //Set HTTP method to GET, oTHERWISE WOULD AIM AT DELETE
      
      res.redirect(303, '/business')
    })
  } catch (e){
    console.error(e)
  }


});

/* secured API for edit contacts */
router.post('/editbusinesscontacts/:id', checkAuthenticated, async function(req, res, next) {
  const _id = req.params.id
  const name = req.query.name
  const number = req.query.number
  const email = req.query.email
  if (_id == 0){
    try {
      const contact = new contactsModel({name, number, email})
      const result = await contact.save()
      //console.log(result.id)
        
      res.redirect(303, '/business')
    } catch (e){
      console.error(e)
    }  
  } else {
    try {
      await contactsModel.findOneAndUpdate({_id}, {name, number, email}, function(err, obj){
        if (err) throw console.error(err)
        console.log({_id, name, number, email} + " object from mongo updated.")
        //Set HTTP method to GET, oTHERWISE WOULD AIM AT DELETE
        
        res.redirect(303, '/business')
      })
    } catch (e){
      console.error(e)
    }  
  }
});


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
