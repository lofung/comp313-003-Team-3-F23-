const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    id:{
        type:Number,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    hashed: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        default: "user"
    },
    active:{
        type: Boolean,
        required: true,
        default: true
    }
    }, {
        collection: 'user'
});

const User = mongoose.model("User", UserSchema);

module.exports = User;