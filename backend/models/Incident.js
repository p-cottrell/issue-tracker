const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Incident', IncidentSchema);