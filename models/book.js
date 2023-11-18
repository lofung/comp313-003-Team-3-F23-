const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
   
    bookTitle: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        require: false
    }
   
  
    });

const Book = mongoose.model("book", bookSchema);

module.exports = Book;