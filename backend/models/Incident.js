const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    userID: mongoose.Schema.Types.ObjectId,
    date: {
        type: Date, default: Date.now
    },
    description: String,
    location: String,
});

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;