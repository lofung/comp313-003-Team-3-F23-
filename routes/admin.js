var express = require('express');
var router = express.Router();
const Book = require('../models/book')
const multer = require('multer')

//image upload
const upload = multer({ dest: './BookImagesUploaded/' })

/* GET Book management page. */
router.get('/bookmgmt', function(req, res, next) {
  res.render('Admin/bookmgmt', { title: 'AdminBooksOnFly', titleBar: 'Book Managment', user: req.user});
});

/* GET Create Book page. */
router.get('/create-book', function(req, res, next) {
  res.render('Admin/addbookform', { title: 'CreateBook', titleBar: 'Create New Book Record', user: req.user});
});


/* POST TO INSERT Create Book page. */
router.post('/create-book', upload.single('image'), function(req, res, next) {

  let fileName = 'noImage.png' //default placeholder image
  if (req.file) {
    fileName = req.file.filename
  }

  const book = new Book({
    bookTitle: req.body.bookTitle,
    image: fileName
    

  });
  book.save((err)=>{
    if(err){
      res.json({message: err.message, type: 'danger'});
    }else {
      req.session.message = {
        type: "success",
        message: "Book added succesfully!"
      };
      res.redirect("/admin/bookmgmt");
    }
  })
  //res.render('Admin/addbookform', { title: 'CreateBook', titleBar: 'Create New Book Record', user: req.user});
});















/* secured API for add book */
router.post('/v1/new',/* checkAuthenticated,*/ async function(req, res, next) {
  let id = 0
  if (req.params.id == "" || req.params.id == null){
      id = new Date().getTime().toString()

  } else {
      id = req.params.id
  }
  console.log(id)
  const name = req.query.name
  const newBook = new booksModel({id, name})


  try {
      const result = await newBook.save()
      //console.log(result.id)
        
      res.redirect(303, '/booklist')
    } catch (e){
      console.error(e)
    }  


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
