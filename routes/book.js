
const booksModel = require('../models/book.js');
const usersModel = require('../models/user.js');

var express = require('express');
var router = express.Router();


/* secured API for one book */
router.get('/v1/getone/:id', async function(req, res, next) {
  const _id = req.params.id
  const tempAllBooks = await booksModel.find({_id})
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
  /*Search*/

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
    const person = await usersModel.findOne({id: userid});
    //console.log(book)
    if (person===null) {
        console.log('Library Card ID not found');
        res.send({status:500, error:"Library Card ID not found"})
        return;
    }

    const book = await booksModel.findOne({id});
    //console.log(book)
    if (book===null) {
        console.log('Book not found');
        res.send({status:500, error:"Book not found"})
        return;
    }

    if (book.bookStatus == 'available') {
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

/* secured API for edit contacts */
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
