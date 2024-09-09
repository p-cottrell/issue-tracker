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

  try {
    const { title, description, status_id, charm, project_id } = req.body;
    const reporter_id = req.user.userID;

    const issue = new Issue({
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

    await issue.save();
    res.status(201).send({message:'Issue created', issueID: issue._id});
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
    const issues = await Issue.find();
   
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

    if (title !== undefined) updateFields.title = title; // Add this line
    if (description !== undefined) updateFields.description = description;
    if (status_id !== undefined) updateFields.status_id = status_id;
    if (charm !== undefined) updateFields.charm = charm;

    // Add reporter_id to the update if it needs to be reset or re-assigned
    updateFields.reporter_id = req.user.id;

    const updatedIssue = await Issue.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true });

    if (!updatedIssue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

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
<<<<<<< HEAD
    // if (
    //   issue.reporter_id.toString() !== req.user.id &&
    //   req.user.role !== 'admin'
    // ) {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }
=======
    if (
      issue.reporter_id.toString() !== req.user.userID &&
      req.user.role !== 'admin'
    ) {

      return res.status(403).json({ message: 'Not authorized' });
    }
>>>>>>> main

    await Issue.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Issue deleted' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res
      .status(500)
      .json({ error: 'Error deleting issue', details: error.message });
  }
});

// Route to check if a user can edit an issue - i did this instead of trying to set a flag in the get check becaause the return was not allowing mapping to work, ruining the dashbaord
// there is probably a better way to do this but this is what i came up with so yolo
router.get('/:id/can-edit', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      console.log('Issue not found');
      return res.status(404).send('Issue not found');
    }

    // Log the reporter_id to check if it's being retrieved correctly
    console.log('Fetched issue reporter_id:', issue.reporter_id);

    // Temporarily skip the canEdit logic and just return the issue for now
    res.status(200).json({ issue });

  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).send('Error fetching issue');
  }
});


module.exports = router;
