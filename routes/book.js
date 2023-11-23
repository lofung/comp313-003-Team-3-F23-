
const booksModel = require('../models/book.js');
const usersModel = require('../models/user.js');

var express = require('express');
var router = express.Router();


/* secured API for one book */
router.get('/v1/getone/:id', async function(req, res, next) {
  const id = req.params.id
  const tempAllBooks = await booksModel.find({id})
  const allBooks = JSON.parse(JSON.stringify(tempAllBooks))
  res.json(allBooks)
});

/* secured API for all books */
router.get('/v1/getall', async function(req, res, next) {
  const tempAllBooks = await booksModel.find({}).sort({name: 'asc'})
  const allBooks = JSON.parse(JSON.stringify(tempAllBooks))
  res.json(allBooks)
});

/* secured API for add book */
router.post('/v1/new', checkAuthenticated, async function(req, res, next) {
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

/* secured API for edit book */
router.put('/v1/editbook/:id', checkAuthenticated, async function(req, res, next) {
  if (req.params.id == "" || req.params.id == null){
    res.redirect(303, '/booklist')
  } else {
      id = req.params.id
  }
  //console.log(id)
  const name = req.query.name
  const expiryDate = req.query.expiryDate
  const bookStatus = req.query.bookStatus

  try {
    let tempBook = await booksModel.findOneAndUpdate(
      {id}, //search for id
      {name, expiryDate, bookStatus}, //update these
      {returnOriginal: true}
      )
        
      res.redirect(303, '/closed/booklist')
    } catch (e){
      console.error(e)
    }  
  

});


/* secured API for delete a book */
//DELETE does not work on button currently so deal with it!!
router.get('/v1/delete/:id', checkAuthenticated, async function(req, res, next) {
  const id = req.params.id
  try {
    await booksModel.deleteOne({id}, function(err, obj){
      if (err) throw console.error(err)
      console.log(id + " object from mongo deleted.")
      //Set HTTP method to GET, oTHERWISE WOULD AIM AT DELETE
      
      res.redirect(303, '/booklist')
    })
  } catch (e){
    console.error(e)
  }


});

/* add a borrow record*/
router.post('/v1/addborrow/', checkAuthenticated, async function(req, res, next) {
  const userid = req.body.customerid
  const id = req.body.bookid // this is book id
  const trxndate = req.body.trxndate
  //how to add 7 days to the date 
  const returndate = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0]
  //console.log(trxndate)
  //console.log(returndate)
  //console.log(id)
  try {

    //check if the user exists
    const person = await usersModel.findOne({id: userid});
    //console.log(book)
    if (person===null) {
        console.log('Library Card ID not found');
        res.send({status:500, error:"Library Card ID not found"})
        return;
    }

    //check if the book exists
    const book = await booksModel.findOne({id});
    //console.log(book)
    if (book===null) {
        console.log('Book not found');
        res.send({status:500, error:"Book not found"})
        return;
    }

    //check if book is reserved by the user
    if (book.reservation[0]!=userid && book.reservation.length>0) {
        console.log('Book is reserved by another user');
        res.send({status:500, error:"Book is reserved by another user"})
        return;
    }

    // last if book is available then allow borrow
    if (book.bookStatus == 'available' || book.bookStatus == 'reserved') {
        book.borrowedBy = userid;
        book.expiryDate = new Date(returndate);
        book.bookStatus = 'borrowed';
        await book.save();
        console.log('Book borrowed successfully.');
        res.send({status:200, message:"Book borrowed successfully."})
    } else {
        console.log('Book is not available for borrowing.');
        res.send({status:500, error:"Book is not available for borrowing."})
    }
} catch (error) {
    console.error('Error borrowing book:', error);
}
})

/* add a return record*/
router.post('/v1/addreturn/', checkAuthenticated, async function(req, res, next) {
  //const userid = req.body.customerid
  const id = req.body.bookid // this is book id
  const trxndate = req.body.trxndate
  //how to add 7 days to the date 
  //const returndate = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0]
  try {

    //check if the book exists
    const book = await booksModel.findOne({id});
    //console.log(book)
    if (book===null) {
        console.log('Book not found');
        res.send({status:500, error:"Book not found, check if book is in this library?"})
        return;
    }

    // last if book is available then allow return
    try {
      book.borrowedBy = "";
      if (book.reservation.length>0) {
        book.bookStatus = 'reserved';
      } else{
        book.bookStatus = 'available';
      }
      await book.save();
      console.log('Book returned successfully.');
      res.send({status:200, message:"Book returned successfully."})
    } catch (e){
        console.log('Book return unsuccessful. Error: ' + e);
        res.send({status:500, error:"Book return unsuccessful. Error: " + e})
    }
} catch (error) {
    console.error('Error borrowing book:', error);
}
})

/* secured API for ADD contacts */
router.post('/v1/edit/:id', checkAuthenticated, async function(req, res, next) {
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
  res.redirect(303, '/login') // make it to GET request then redirect
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect(303, '/') // make it to GET request then redirect
  }
  return next()
}

module.exports = router;
