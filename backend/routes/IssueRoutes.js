/**
 * Issue Management Routes
 *
 * This module defines routes for creating, retrieving, updating, and deleting issues
 * Each route uses JWT-based authentication to ensure that only authorised users can
 * interact with the issues.
 *
 * IMPORTANT: AuthenticateToken authenticates using cookies so when calling the API on
 * the front-end you must use apiClient (api/apiClient) to ensure authentication cookies
 * are passed too.
 *
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authenticateToken = require('../middleware/authenticateToken');
const Issue = require('../models/Issue');

const router = express.Router();

/**
 * Route to create a new issue
 *
 * This route allows an authenticated user to create a new incident. The user must provide a title,
 * description, and location for the incident. The incident is associated with the authenticated
 * user's ID and stored in the database.
 *
 * @name POST /issues
 * @function
 * @memberof module:routes/issues
 * @param {Object} req.body - The issue data (title, description, location).
 * @param {Object} res - The response object.
 */
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, status_id, charm, project_id } = req.body;
  const reporter_id = req.user.userID;

  const issue = new Issue ({
    reporter_id,
    title,
    description,
    charm,
  });

  if (status_id) {
    issue.status_id = status_id;
  }
  if (project_id) {
    issue.project_id = project_id;
  }
  try {

    await issue.save();
    res.status(201).send({message:'Incident created', issueID: issue._id});
  } catch (error) {
    res.status(500).send({error: 'Error creating incident', details: error.message } );
  }
});






router.get('/', authenticateToken, async (req, res) => {
  try {
    const issues = await Issue.find({ reporter_id: req.user.userID });
   
    if (issues.length === 0) {
      return res.status(404).send('No incidents found');
    }
    res.status(200).json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).send('Error fetching issues');
  }
});







router.put('/:id', authenticateToken, async (req, res) => {
  const { description, status_id, charm } = req.body; 
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Ensure the user is authorized to update the issue
    if (issue.reporter_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update the issue with the new data
    issue.description = description || issue.description;
    issue.status_id = status_id !== undefined ? status_id : issue.status_id;
    issue.charm = charm || issue.charm;
    issue.updated_at = Date.now();

    const updatedIssue = await issue.save();

    res.status(200).json({ message: 'Issue updated', updatedIssue });
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ error: 'Error updating issue', details: error.message });
  }
})

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    
    const incident = await Incident.findById(req.params.id).populate(
      'occurrences'
    );

    if (!incident) {
      return res.status(404).send('Incident not found');
    }

    // Ensure the user making the request is the crerator  of the incident
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
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if the user is authorized to delete the issue or if they are an admin then can delete any issue
    // if (issue.reporter_id.toString() !== req.user.userID || req.user.role !== 'admin') { // Check if the user is an admin was removed because req.user.role is undefined.
    if (issue.reporter_id.toString() !== req.user.userID) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Issue.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Issue deleted' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ error: 'Error deleting issue', details: error.message });
  }
});

module.exports = router;