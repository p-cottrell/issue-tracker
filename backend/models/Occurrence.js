const mongoose = require('mongoose');

// Schemas for occurances
const occurrenceSchema = new mongoose.Schema({
    incident :{
        type:mongoose.Schema.Types.ObjectId, ref:'Incident',
        required:true
    },
    description: {
        type: String,
        required : true
    },
    occuredAt: {
        type: Date,
        default: Date.now
    },
    reportedby:{
        type:mongoose.Schema.Types.ObjectId, ref:'User',
        required:true
    },
});

const occurrence = mongoose.model('Occurrence', occurrenceSchema);

module.exports = occurrence;