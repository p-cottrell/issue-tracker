/**
 * Incident Management Routes
 *
 * This module defines routes for creating, retrieving, updating, and deleting issues
 * Each route uses JWT-based authentication to ensure that only authorised users can
 * interact with the issues.
 *
 * IMPORTANT: AuthenticateToken authenticates using cookies so when calling the API on
 * the front-end you must use {withCredentials: true} to ensure authentication cookies
 * are passed too.
 *
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authenticateToken = require('../middleware/authenticateToken');
const Incident = require('../models/Incident');

const router = express.Router();

/**
 * Route to create a new issue
 *
 * This route allows an authenticated user to create a new incident. The user must provide a title,
 * description, and location for the incident. The incident is associated with the authenticated
 * user's ID and stored in the database.
 *
 * @name POST /incidents
 * @function
 * @memberof module:routes/incidents
 * @param {Object} req.body - The incident data (title, description, location).
 * @param {Object} res - The response object.
 */
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, location } = req.body;
  const userID = req.user.userID;

  const incident = new Incident({ userID, description, location, title });
  try {
    await incident.save();
    res.status(201).send({message:'Incident created', incidentID: incident._id});
  } catch (error) {
    res.status(500).send('Error creating incident');
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('userID:', req.user.userID);
    const incidents = await Incident.find({ userID: req.user.userID });
    if (!incidents.length) {
      return res.status(404).send('No incidents found');
    }
    res.status(200).json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).send('Error fetching incidents');
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { description, location } = req.body;

  try {

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).send('Incident not found');
    }


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
    const incident = await Incident.findById(req.params.id).populate(
      'occurrences'
    );

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