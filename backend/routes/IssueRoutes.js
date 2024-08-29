/**
 * Issue Management Routes
 *
 * This module defines routes for creating, retrieving, updating, and deleting issues.
 * Each route uses JWT-based authentication to ensure that only authorized users can
 * interact with the issues.
 *
 * IMPORTANT: `authenticateToken` middleware authenticates using cookies, so when calling the API
 * from the front-end, you must use `{ withCredentials: true }` to ensure authentication cookies are passed.
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
 * This route allows an authenticated user to create a new issue. The user must provide a title,
 * description, and other optional fields like status_id, charm, and project_id.
 * The issue is associated with the authenticated user's ID and stored in the database.
 *
 * @name POST /issues
 * @function
 * @memberof module:routes/issues
 * @param {Object} req.body - The issue data (title, description, status_id, charm, project_id).
 * @param {Object} res - The response object.
 * @throws {500} - If an error occurs while creating the issue.
 */
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, status_id, charm, project_id } = req.body;
  const reporter_id = req.user.id;

  const issueData = {
    reporter_id,
    title,
    description,
    charm,
  };

  if (status_id) {
    issueData.status_id = status_id;
  }
  if (project_id) {
    issueData.project_id = project_id;
  }

  try {
    const newIssue = new Issue(issueData); // Create a new instance of Issue
    await newIssue.save(); // Save the new issue to the database
    res.status(201).send({ message: 'Issue created', issueID: newIssue._id });
  } catch (error) {
    res
      .status(500)
      .send({ error: 'Error creating issue', details: error.message });
  }
});

/**
 * Route to retrieve all issues for the authenticated user
 *
 * This route allows an authenticated user to retrieve all issues that they have reported.
 *
 * @name GET /issues
 * @function
 * @memberof module:routes/issues
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {404} - If no issues are found for the user.
 * @throws {500} - If an error occurs while retrieving the issues.
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const issues = await Issue.find({ reporter_id: req.user.id });

    if (issues.length === 0) {
      return res.status(404).send('No issues found');
    }
    /* if (!issues.reporter_id || !req.user || !req.user.id) {
      return res.status(400).json({ message: 'Invalid data: reporter ID or user ID is missing' });
    }

    // Ensure the user making the request is the creator of the issue or an admin
    if (issues.reporter_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const canEdit =
      issues.reporter_id.toString() === req.user.id || req.user.role === 'admin'; // allow admin to edit all issues 
 */
    res.status(200).json({ issues}); // can edit flag 
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).send('Error fetching issues');
  }
});

/**
 * Route to update an existing issue
 *
 * This route allows an authenticated user to update the details of an existing issue that they reported.
 * The user can update fields such as description, status_id, and charm.
 *
 * @name PUT /issues/:id
 * @function
 * @memberof module:routes/issues
 * @param {Object} req.body - The new data for the issue (description, status_id, charm).
 * @param {Object} res - The response object.
 * @throws {404} - If the issue is not found.
 * @throws {403} - If the user is not authorized to update the issue.
 * @throws {500} - If an error occurs while updating the issue.
 */
router.put('/:id', authenticateToken, async (req, res) => {
  const { description, status_id, charm } = req.body;

  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Ensure the user is authorized to update the issue
    if (issue.reporter_id.toString() !== req.user.id || req.user.role !== 'admin') {
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
    res
      .status(500)
      .json({ error: 'Error updating issue', details: error.message });
  }
});

/**
 * Route to retrieve a single issue by its ID
 *
 * This route allows an authenticated user to retrieve a specific issue they reported by its ID.
 * The issue's occurrences are also populated.
 *
 * @name GET /issues/:id
 * @function
 * @memberof module:routes/issues
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {404} - If the issue is not found.
 * @throws {403} - If the user is not authorized to view the issue.
 * @throws {500} - If an error occurs while retrieving the issue.
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('occurrences');

    if (!issue) {
      return res.status(404).send('Issue nttt found');
    }

    // Ensure the user making the request is the creator of the issue
    // this is commented out because we want to see all issues and then be able to edit based on the user id
    // if (!issue.reporter_id ||issue.reporter_id.toString() !== req.user.id) {
    //   return res.status(403).send('Not authorized');
    // }

    res.status(200).json(issue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).send('Error fetching issue');
  }
});

/**
 * Route to delete an issue
 *
 * This route allows an authenticated user to delete an issue they reported.
 * An admin user can delete any issue.
 *
 * @name DELETE /issues/:id
 * @function
 * @memberof module:routes/issues
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {404} - If the issue is not found.
 * @throws {403} - If the user is not authorized to delete the issue.
 * @throws {500} - If an error occurs while deleting the issue.
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if the user is authorized to delete the issue or if they are an admin
    if (
      issue.reporter_id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Issue.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Issue deleted' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res
      .status(500)
      .json({ error: 'Error deleting issue', details: error.message });
  }
});

module.exports = router;
