const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        require: false
    },

    author: {
        type: String,
        
    },
    genre: String,
    publishedDate: Date,
    isbn: {
        type: String,
        /*unique: true,*/
        
    },
    description: String,
    copiesAvailable: {
        type: Number,
        default: 1,
    },
    weight: Number,
    comments :{
        type: [String],
        default: []
    },
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    }



});

const Book = mongoose.model("book", bookSchema);

module.exports = Book;