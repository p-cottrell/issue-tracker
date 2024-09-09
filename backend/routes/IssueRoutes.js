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
 * @throws {400} - If required fields are missing or validation fails.
 * @throws {500} - If an error occurs while creating the issue.
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, status_id, charm, project_id } = req.body;
    const reporter_id = req.user.id; // Ensure this matches your `authenticateToken` middleware

    // Validate required fields
    if (!title || !description) {
      return res.status(400).send({ error: 'Title and description are required.' });
    }

    // Create a new issue instance
    const issue = new Issue({
      reporter_id,
      title,
      description,
      charm,
      status_id: status_id || undefined, // Optional field
      project_id: project_id || undefined, // Optional field
    });

    await issue.save();
    res.status(201).send({ message: 'Issue created', issueID: issue._id });
  } catch (error) {
    console.error('Error creating issue:', error); // Add console logging for error debugging
    res.status(500).send({ error: 'Error creating issue', details: error.message });
  }
});

/**
 * Route to retrieve all issues or issues by a specific user
 *
 * This route allows an authenticated user to retrieve all issues.
 * If a `userId` is provided as a query parameter, it filters the issues
 * to only those reported by that specific user.
 *
 * @name GET /issues
 * @function
 * @memberof module:routes/issues
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {404} - If no issues are found.
 * @throws {500} - If an error occurs while retrieving the issues.
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from query parameters

    // If userId is provided, ensure it is converted to an ObjectId for MongoDB queries
    const query = userId ? { reporter_id: new mongoose.Types.ObjectId(userId) } : {};

    const issues = await Issue.find(query);

    if (issues.length === 0) {
      return res.status(404).send('No issues found');
    }

    res.status(200).json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).send('Error fetching issues');
  }
});


/**
 * Route to retrieve a single issue by its ID
 *
 * This route allows an authenticated user to retrieve a specific issue by its ID.
 * The issue's occurrences are also populated.
 * Only the reporter of the issue or an admin can access the issue.
 *
 * @name GET /issues/:id
 * @function
 * @memberof module:routes/issues
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {404} - If the issue is not found.
 * @throws {403} - If the user is not authorized to view the issue.
 * @throws {500} - If an error occurs while retrieving the issue.
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Convert the ID from the request parameters to a MongoDB ObjectId
    const issueId = new mongoose.Types.ObjectId(req.params.id);

    // Find the issue by ID and populate its occurrences
    const issue = await Issue.findById(issueId).populate('occurrences');

    // Check if the issue exists
    if (!issue) {
      return res.status(404).send('Issue not found');
    }

    // Check if the authenticated user is the reporter or an admin
    if (issue.reporter_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).send('Not authorized');
    }

    // Return the issue if all checks pass
    res.status(200).json(issue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).send('Error fetching issue');
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
  const { title, description, status_id, charm } = req.body;

  try {
    const updateFields = {
      updated_at: Date.now()
    };

    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (status_id !== undefined) updateFields.status_id = status_id;
    if (charm !== undefined) updateFields.charm = charm;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if the authenticated user is the reporter or an admin
    if (issue.reporter_id.toString() !== req.user.userID && req.user.role !== 'admin') {
      return res.status(403).send('Not authorized to update this issue');
    }

    // Update the issue fields
    Object.assign(issue, updateFields);
    await issue.save();

    res.status(200).json({ message: 'Issue updated', updatedIssue: issue });
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ error: 'Error updating issue', details: error.message });
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

    if (issue.reporter_id.toString() !== req.user.userID && req.user.role !== 'admin') {
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