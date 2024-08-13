require('dotenv').config();
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Occurrence = require('../models/Occurrence');
const Incident = require('../models/Incident');




// this is the route setting for the occurances, allows the user to add occurances to incidents that have alread
//been reported.
//gets the initial incident and pushes it into it


router.post(
  '/:incidentId',
  authenticateToken,
  async (req, res) => {
    const { description } = req.body;
    const incidentID = req.params.incidentId.trim(); // remove any leading/trailing whitespace

    try {
      // Find the related incident
      const incident = await Incident.findById(incidentID);
      if (!incident) {
        console.log({incidentID});
        return res.status(404).json({ error: 'Incident not found'}); ;
      }

      // Create a new occurrence
      const newOccurrence = new Occurrence({
        incident: incidentID,
        description,
        reportedBy: req.user.userID,
      });

      await newOccurrence.save();

      // Add the occurrence to the incident's occurrences array
      incident.occurrences.push(newOccurrence._id);
      await incident.save();

      res.status(201).json({ message: 'Occurrence created', occurrenceId: newOccurrence._id });
    } catch (error) {
      res.status(500).json({ error: 'Error creating occurrence', details: error.message });
    }
  }
);
// find all occurances for a specific incident
router.get('/incidents/:id/occurrences', authenticateToken, async (req, res) => {
  try {
    const incidentID = req.params.id;
    const incident = await Incident.findById(incidentID).populate('occurrences');
    
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.status(200).json(incident.occurrences);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching occurrences', details: error.message });
  }
});

module.exports = router;