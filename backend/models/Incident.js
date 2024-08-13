
const mongoose = require('mongoose');

// Schemas for incidents
const incidentSchema = new mongoose.Schema({
  userID: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    required: true
  },
  occurrences: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Occurrence'
  }],
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true },
});

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;