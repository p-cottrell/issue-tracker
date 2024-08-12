const mongoose = require('mongoose');

// Schemas for incidents
const incidentSchema = new mongoose.Schema({
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

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;