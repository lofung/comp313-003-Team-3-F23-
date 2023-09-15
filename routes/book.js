
const booksModel = require('../models/book.js');

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
