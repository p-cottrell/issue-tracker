const mongoose = require('mongoose');

// schema for users
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 255,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 512,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        enum:['user', 'admin'],
        default: 'user',
        required: true,
    },
});

const User= mongoose.model('User', userSchema);

module.exports = User;