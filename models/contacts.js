const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    number:{
        type:Number
    },
    email: {
        type: String
    },
    }, {
        collection: 'contact'
});

const Contact = mongoose.model("contact", contactSchema);

module.exports = Contact;