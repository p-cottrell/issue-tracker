const mongoose = require('mongoose');

// schema for users
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdministrator: {
        type: Boolean,
        default:true, // this is true for testing purposes obvs
        required: false}
});

const User= mongoose.model('User', userSchema);

module.exports = User;