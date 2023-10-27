const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    id:{
        type:Number,
        unique: true,
        min: 1,
        required: true,
        default: new Date().getTime()
    },
    name: {
        type: String,
        required: true,
    },
    borrowedBy: {
        type: String
    },
    expiryDate: {
        type: Date,
        default: new Date().toISOString().split("T")[0] 
    },
    reservation: {
        type: [String]
    }, 
    pastBorrowers: {
        type: [String]
    },
    comments :{
        type: Array,
        default: []
    },
    bookStatus: {
        type: String,
        default: 'available'
    }
    }, {
        collection: 'book'
});

const Book = mongoose.model("book", bookSchema);

module.exports = Book;