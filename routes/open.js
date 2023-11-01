
const contactsModel = require('../models/contacts.js');
const booksModel = require('../models/book.js');
const axios = require('axios');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('homepage_open', { title: 'Homepage', user: req.user});
});

router.get('/login', checkNotAuthenticated, function(req, res, next) {
  res.render('login_open', { title: 'Login', user: req.user});
});

router.get('/register', checkNotAuthenticated, function(req, res, next) {
  res.render('register_open', { title: 'Register', user: req.user});
});

/* GET feedback page. */
router.get('/feedback', function(req, res, next) {
  res.render('feedback_open', { title: 'Feedback', user: req.user, success: true});
});


/* GET home page. */
router.get('/home', function(req, res, next) {
  res.render('homepage_open', { title: 'Homepage', user: req.user});
});

/* GET Borrow page. */
router.get('/borrow', function(req, res, next) {
  res.render('borrow_open', { title: 'Borrow', user: req.user});
});

/* GET Return page. */
router.get('/return', function(req, res, next) {
  res.render('return_open', { title: 'Return', user: req.user});
});

/* GET BOOKS index page. */
router.get('/booklist', function(req, res, next) {
  res.render('booklist_open', { title: 'Book List', user: req.user});
});

/* GET BOOK detail page. */
router.get('/bookDetails/:id', async function(req, res, next) {
  const _id = req.params.id
  const tempBook = await booksModel.find({_id})
  res.render('bookdetail_open', { title: 'Book Details', book: tempBook[0], user: req.user});
});

/* GET BOOK return and feedback form. */
router.get('/returnbook/:id', async function(req, res, next) {
  const _id = req.params.id
  const tempBook = await booksModel.find({_id})
  res.render('bookreturn_open', { title: 'Book Return and Feedback', book: tempBook[0], user: req.user});
});

/* POST BOOK return and feedback form. */
router.post('/bookreturnfb/:id', async function(req, res, next) {
  const _id = req.params.id
  const feedback = req.body.comment
  
  const feedbackData = {
    name : feedback,
  };

  const feedbackJSON = JSON.stringify(feedbackData);

  const apiUrl = 'http://127.0.0.1:8354/analyze_sent';
  //Send the comment to Sentiment Analysis API
  try {
    const response = await axios.post(apiUrl, feedbackJSON, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle the API response
    if (response.status === 200) {
      res.status(200).send('Thank god it worked!');
    } else {
      res.status(response.status).send('Feedback submission failed');
    }
  } catch (error) {
    console.error('Error sending feedback:', error);
    res.status(500).send('Error sending feedback');
  }

// TO DO: Save comment to DB, increment upvotes or downvotes as appropriate, redirect to booklist, API response logic
//  const tempBook = await booksModel.find({_id});
});


router.get('/business', checkAuthenticated, function(req, res, next) {
  res.render('businessViews_open', { title: 'Business Contacts', user: req.user});
});

router.get('/addbookform', checkAuthenticated, function(req, res, next) {
  res.render('addbookform_open', { title: 'Add Book Form', user: req.user});
});

router.get('/businessedit/:id', checkAuthenticated, function(req, res, next) {
  res.render('businessEdit_open', { title: 'Business Contacts Edit', _id: req.params.id, user: req.user});
});

/* GET Services page. */
router.get('/services', function(req, res, next) {
  res.render('services_open', { title: 'Services', user: req.user});
});

/* GET Contact Us page. */
router.get('/contact', function(req, res, next) {
  res.render('contact_open', { title: 'Contact', user: req.user});
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
        
      res.redirect(303, '/business_open')
    } catch (e){
      console.error(e)
    }  
  } else {
    try {
      await contactsModel.findOneAndUpdate({_id}, {name, number, email}, function(err, obj){
        if (err) throw console.error(err)
        console.log({_id, name, number, email} + " object from mongo updated.")
        //Set HTTP method to GET, oTHERWISE WOULD AIM AT DELETE
        
        res.redirect(303, '/business_open')
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
  res.redirect('/login_open')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/')
  }
  return next()
}

module.exports = router;
