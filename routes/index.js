var express = require('express');
var router = express.Router();
const Book = require('../models/book')
const Delivery = require('../models/delivery')


/* GET home page. */
router.get('/', function (req, res, next) {
  Book.find().sort({ title: 1, genre: 1 }).exec((err, books) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.render('homepage', { title: 'BooksOnFly', user: req.user, books: books });
    }
  });

});


/* GET Book Details page. */
router.get('/book-details/:id', function (req, res, next) {

  let id = req.params.id;
  Book.findById(id, (err, book) => {
    if (err) {
      alert("Book ERROR")
    } else {
      if (book == null) {
        alert("Book not found ERROR")
      } else {
        res.render('bookdetails', { title: 'Bookdetails', user: req.user, book: book });
      }
    }
  })


})


router.get('/login', checkNotAuthenticated, function (req, res, next) {
  res.render('login', { title: 'Login', user: req.user });
});

router.get('/register', checkNotAuthenticated, function (req, res, next) {
  res.render('register', { title: 'Register', user: req.user });
});


/* POST TO Insert Comments of books*/
router.post('/comment/:id', checkAuthenticated, function (req, res, next) {

  console.log(req.body.comment);
  var id = req.params.id

  Book.findByIdAndUpdate(id,
    { $push: { comments: { comment: req.body.comment, user_id: req.user._id, userName: req.user.name, date: new Date() } } }, (err, book) => {

      if (err) {
        res.json({ error: "error posting comment" });
      } else {
        res.redirect("/book-details/" + id);
      }
    })
});



/* Get Delivery page*/
router.get('/delivery/:id', checkAuthenticated, function (req, res, next) {

  var id = req.params.id


  Book.findById(id, (err, book) => {
    if (err) {
      console.log("Book ERROR")
    } else {
      if (book == null) {
        console.log("Book not found ERROR")
      } else {
        res.render('delivery', { title: 'Drone Delivery', user: req.user, book: book });
      }
    }
  })


});



/*Post Delivery confirmation page*/
router.post('/delivery/confirm/:id', checkAuthenticated, function (req, res, next) {

  var id = req.params.id

  Book.findByIdAndUpdate(id, {
    $inc: { copiesAvailable: -1 }
  }, (err, book) => {

    if (err) {
      res.redirect('/error');
    } else {
      //res.redirect("/");
    }
  })

  const delivery = new Delivery({
    user_id: req.user._id,
    book_id: id,
    address: req.body.address,
    latitude: req.body.latitude,
    longitude: req.body.longitude    

  });

  delivery.save((err) => {
    if (err) {
      res.json({ message: err.message, type: 'danger' });
    } else {
      req.session.message = {
        type: "success",
        message: "Book Borrowed succesfully!"
      };

      //res.locals.message = "Book added succesfully!";

      res.redirect("/");
    }
  })




});


/*****************************************************
Middleware Functions
******************************************************/


function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.locals.message = req.message
  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/')
  }
  return next()
}







/* GET Borrow page. */
router.get('/borrow', checkAuthenticated, function (req, res, next) {
  res.render('borrow', { title: 'Borrow', user: req.user });
});

/* GET Return page. */
router.get('/return', checkAuthenticated, function (req, res, next) {
  res.render('return', { title: 'Return', user: req.user });
});






module.exports = router;
