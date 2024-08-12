require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authenticateToken = require('../middleware/authenticateToken');
const Incident = require('../models/Incident');


const router = express.Router();

// CRUD operations for incidents

router.post('/', authenticateToken,  async (req, res) => {
  const { description, location } = req.body;
  const userID = req.user.userID;
  console.log('userID',req.user.userID);
  const incident = new Incident({userID, description, location });
  try {
    await incident.save();
    res.status(201).send('Incident created');
    console.log('Incident', incident);
    console.log('userIDDD',req.user.userID);
  } catch (error) {
    res.status(500).send('Error creating incident');
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const incidents = await Incident.find({ userID: req.user.userID });
    res.send(incidents);
  } catch (error) {
    res.status(500).send('Error fetching incidents');
  }
});





router.put('/:id', authenticateToken, async (req, res) => {
  const { description, location } = req.body;

  try {
    // Find the incident first to check the userID
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).send('Incident not found');
    }

    // Ensure the user making the request is the owner of the incident
    if (incident.userID.toString() !== req.user.userID) {
      return res.status(403).send('Not authorized');
    }

   
    const updatedIncident = await Incident.findByIdAndUpdate(
      req.params.id,
      { description, location },
      { new: true, runValidators: true }
    );

    res.send('Incident updated');
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(400).send('Error updating incident');
  }
});



router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Find the incident first to check the userID
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).send('Incident not found');
    }

    // Ensure the user making the request is the owner of the incident
    if (incident.userID.toString() !== req.user.userID) {
      return res.status(403).send('Not authorized');
    }

  
    res.status(200).json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status().send('Error fetching incident');
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.syatus(404).send('incident not found');
    }
    console.log("userIDDD",incident.userID);
    if (incident.userID.toString() !== req.user.userID) {
      return res.status(403).send('Not authorized');
    }

    await Incident.findByIdAndDelete(req.params.id);
    res.send('Incident deleted');
  } catch (error) {
    res.status(500).send('Error deleting incident');
  }
});

module.exports = router;