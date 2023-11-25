var express = require('express');
var router = express.Router();
const Book = require('../models/book')
const Delivery = require('../models/delivery')

const multer = require('multer')
const fs = require('fs')

//image upload
const upload = multer({ dest: './BookImagesUploaded/' })

/* GET Book management page. */
router.get('/bookmgmt', function (req, res, next) {
  //res.locals.message = "test";
  // Access the query parameter and pass it as a local variable
  const message = req.query.message || "";


  Book.find().sort({ title: 1 }).exec((err, books) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.render('Admin/bookmgmt', { title: 'AdminBooksOnFly', titleBar: 'Book Managment', user: req.user, message, books: books });
    }
  });


});

/* GET Create Book page. */
router.get('/create-book', function (req, res, next) {
  res.render('Admin/addbookform', { title: 'CreateBook', titleBar: 'Create New Book Record', user: req.user });
});


/* POST TO INSERT Create Book page. */
router.post('/create-book', upload.single('image'), function (req, res, next) {

  let fileName = 'noImage.png' //default placeholder image
  if (req.file) {
    fileName = req.file.filename
  }

  const book = new Book({
    title: req.body.title,
    image: fileName,
    author: req.body.author,
    genre: req.body.genre,
    publishedDate: req.body.publishedDate,
    isbn: req.body.isbn,
    description: req.body.description,
    copiesAvailable: req.body.copiesAvailable,
    weight: req.body.weight

  });
  book.save((err) => {
    if (err) {
      res.json({ message: err.message, type: 'danger' });
    } else {
      req.session.message = {
        type: "success",
        message: "Book added succesfully!"
      };

      //res.locals.message = "Book added succesfully!";

      res.redirect("/admin/bookmgmt?message=Book%20Record%20Created");
    }
  })
  //res.render('Admin/addbookform', { title: 'CreateBook', titleBar: 'Create New Book Record', user: req.user});
});



/* GET Update Book Form page. */
router.get('/update-book/:id', function (req, res, next) {

  let id = req.params.id;
  Book.findById(id, (err, book) => {
    if (err) {
      res.redirect('/admin/bookmgmt?Book%20Update%20Error');
    } else {
      if (book == null) {
        res.redirect("/admin/bookmgmt?Book%20Not%20Found");
      } else {
        res.render('Admin/editBook', { title: 'UpdateBook', titleBar: 'Update Book Record', user: req.user, book });
      }
    }
  })


})

/* POST Update Book page. */
router.post('/update-book/:id', upload.single('image'), function (req, res, next) {



  let id = req.params.id;


  //Sanjay, replace old image if new image uploaded.
  let fileName = 'noImage.png' //default placeholder image
  if (req.file) {
    fileName = req.file.filename;
    try {
      fs.unlinkSync("./BookImagesUploaded/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    fileName = req.body.old_image;
  }


  Book.findByIdAndUpdate(id, {
    title: req.body.title,
    image: fileName
  }, (err, book) => {

    if (err) {
      res.redirect('/admin/bookmgmt?Book%20Update%20Error');
    } else {
      res.redirect("/admin/bookmgmt?message=Book%20Record%20Updated");
    }
  })


})

/* POST Update Book page. */
router.get('/delete-book/:id', function (req, res, next) {

  let id = req.params.id;

  Book.findByIdAndRemove(id, (err, book) => {

    if (book.image != '' && book.image != 'noImage.png') {
      try {
        fs.unlinkSync("./BookImagesUploaded/" + book.image);
      } catch (err) {
        console.log(err);
      }

    }

    if (err) {
      res.redirect('/admin/bookmgmt?Book%20Delete%20Error');
    } else {
      res.redirect("/admin/bookmgmt?message=Book%20Record%20Deleted");
    }


  })


})




/* GET home page. */
router.get('/dronedispatch', async function (req, res, next) {

  const deliveries = await Delivery
    .find({
      // user_id: req.user._id, // replace with the actual user_id
      // status: "0processing", //books for drone dispatch
      //returnDate: { $exists: false }
    })
    .populate('user_id')
    .populate('book_id')
    //.sort('book_id.title');
    .sort({ 'delivery.borrowDate': 1 });

  //console.log(deliveries);


  const returnDeliveries = await Delivery
    .find({
      //  user_id: req.user._id, // replace with the actual user_id
      returnDate: { $exists: true }
    })
    .populate('user_id')
    .populate('book_id')
    .sort('book_id.title');


  res.render('Admin/deliveries', { title: 'Drone Dispatch', titleBar: 'Drone Dispatch', user: req.user, deliveries: deliveries, returnDeliveries: returnDeliveries });



});



/* POST Update Book page. */
/*
router.get('/deliveryDispatch/:id/:status', function (req, res, next) {

  let id = req.params.id;
  let status = req.params.status;

  if (status == '5returned') {

    Delivery.findByIdAndUpdate(id, { $set: { status: status, returnDate: new Date() } },
      { new: true },
      (err, delivery) => {
        if (err) {
          //alert("Book ERROR")
          res.send("delivery ERROR");
        } else {

          //console.log(delivery.book_id)

          Book.findByIdAndUpdate(delivery.book_id, {
            $inc: { copiesAvailable: 1 }
          }, (err, book) => {

            if (err) {
              res.redirect('/error');
            } else {
              res.send("error updating book copies");
              //res.redirect("/");
            }
          })
         
            res.redirect('/admin/dronedispatch?message=dispatched');        


        }
      })


  }
  else {

    Delivery.findByIdAndUpdate(id, { $set: { status: status } },
      (err, delivery) => {
        if (err) {
          //alert("Book ERROR")
          res.send("delivery ERROR");
        } else {

          if (status == '3toPickup') {
            res.redirect('/mybooks'); //user page
          }
          else {
            res.redirect('/admin/dronedispatch?message=dispatched');
          }


        }
      })

  }


})

*/


/* POST Update Book page. */
router.get('/deliveryDispatch/:id/:status', function (req, res, next) {
  let id = req.params.id;
  let status = req.params.status;

  if (status == '5returned') {
      Delivery.findByIdAndUpdate(
          id,
          { $set: { status: status, returnDate: new Date() } },
          { new: true },
          (err, delivery) => {
              if (err) {
                  res.status(500).send("Delivery update error");
              } else {
                  Book.findByIdAndUpdate(
                      delivery.book_id,
                      { $inc: { copiesAvailable: 1 } },
                      (err, book) => {
                          if (err) {
                              res.status(500).send("Book update error");
                          } else {
                              // Move the common redirect outside the if-else block
                              redirectToDispatched(res);
                          }
                      }
                  );
              }
          }
      );
  } else {
      Delivery.findByIdAndUpdate(
          id,
          { $set: { status: status } },
          (err, delivery) => {
              if (err) {
                  res.status(500).send("Delivery update error");
              } else {
                  if (status == '3toPickup') {
                      res.redirect('/mybooks'); // user page
                  } else {
                      // Move the common redirect outside the if-else block
                      redirectToDispatched(res);
                  }
              }
          }
      );
  }

  function redirectToDispatched(res) {
      res.redirect('/admin/dronedispatch?message=dispatched');
  }
});





router.get('/login', checkNotAuthenticated, function (req, res, next) {
  res.render('login', { title: 'Login', user: req.user });
});

router.get('/register', checkNotAuthenticated, function (req, res, next) {
  res.render('register', { title: 'Register', user: req.user });
});



/* GET Borrow page. */
router.get('/borrow', checkAuthenticated, function (req, res, next) {
  res.render('borrow', { title: 'Borrow', user: req.user });
});

/* GET Return page. */
router.get('/return', checkAuthenticated, function (req, res, next) {
  res.render('return', { title: 'Return', user: req.user });
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
