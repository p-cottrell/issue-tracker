require('dotenv').config();
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Issue = require('../models/Issue'); 

/**
 * Occurrence Management Routes
 *
 * This module defines routes for creating, retrieving, and deleting occurrences
 * associated with specific issues. Each route uses JWT-based authentication to 
 * ensure that only authorized users can interact with the occurrences.
 *
 * IMPORTANT: `authenticateToken` middleware authenticates using cookies, so when 
 * calling the API from the front-end, you must use `{ withCredentials: true }` to 
 * ensure authentication cookies are passed.
 */

/**
 * Route to create a new occurrence for a specific issue
 *
 * This route allows an authenticated user to add a new occurrence to an existing issue.
 * The issue is identified by `issueId`, and the occurrence details are provided in the request body.
 * The occurrence is associated with the authenticated user's ID and appended to the issue's 
 * `occurrences` array.
 *
 * @name POST /:issueId
 * @function
 * @memberof module:routes/occurrences
 * @param {Object} req.body - The occurrence data (description).
 * @param {Object} res - The response object.
 * @throws {404} - If the issue is not found.
 * @throws {500} - If an error occurs while creating the occurrence.
 */
router.post('/:issueId', authenticateToken, async (req, res) => {
  const { description } = req.body;
  const issueId = req.params.issueId;

  try {
    const newOccurrence = {
      user_id: req.user.id,
      description,
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    // used to push the new occurrence to the issue without requiring all the other fields to exist
    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      { $push: { occurrences: newOccurrence } },
      { new: true, runValidators: false }
    );

    if (!updatedIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.status(201).json({ message: 'Occurrence added', occurrence: newOccurrence });
  } catch (error) {
    console.error('Error adding occurrence:', error);
    res.status(500).json({ error: 'Error adding occurrence', details: error.message });
  }
});

/**
 * Route to retrieve all occurrences for a specific issue
 *
 * This route allows an authenticated user to retrieve all occurrences associated 
 * with a specific issue. The issue is identified by `issueId`, and the occurrences 
 * are returned in the response.
 *
 * @name GET /issues/:id/occurrences
 * @function
 * @memberof module:routes/occurrences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {404} - If the issue is not found.
 * @throws {500} - If an error occurs while fetching the occurrences.
 */
router.get('/issues/:id/occurrences', authenticateToken, async (req, res) => {
  try {
    const issueID = req.params.id;
    const issue = await Issue.findById(issueID);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Return the occurrences array directly, since it's an embedded subdocument
    res.status(200).json(issue.occurrences);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching occurrences', details: error.message });
  }
});

/**
 * Route to delete a specific occurrence from an issue
 *
 * This route allows an authenticated user to delete a specific occurrence from an 
 * issue. The issue is identified by `issueId` and the occurrence by `occurrenceId`.
 * Only the user who created the occurrence or an admin can delete it.
 *
 * @name DELETE /:issueId/:occurrenceId
 * @function
 * @memberof module:routes/occurrences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {404} - If the issue or occurrence is not found.
 * @throws {403} - If the user is not authorized to delete the occurrence.
 * @throws {500} - If an error occurs while deleting the occurrence.
 */
router.delete('/:issueId/:occurrenceId', authenticateToken, async (req, res) => {
  try {
    const { issueId, occurrenceId } = req.params;

    // Find the issue and remove the occurrence
    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      { $pull: { occurrences: { _id: occurrenceId } } },
      { new: true } // This option returns the updated document
    );

    if (!updatedIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    

    res.status(200).json(updatedIssue);
  } catch (error) {
    console.error('Error deleting occurrence:', error);
    res.status(500).json({ error: 'Error deleting occurrence', details: error.message });
  }
});

/**
 * Route to update a specific occurrence for an issue
 *
 * This route allows an authenticated user to update the description of a specific occurrence
 * within an issue. The issue is identified by `issueId` and the occurrence by `occurrenceId`.
 * The updated description is provided in the request body.
 *
 * @name PUT /:issueId/:occurrenceId
 * @function
 * @memberof module:routes/occurrences
 * @param {Object} req.body - The updated occurrence data (description).
 * @param {Object} res - The response object.
 * @throws {404} - If the issue or occurrence is not found.
 * @throws {500} - If an error occurs while updating the occurrence.
 */

router.put('/:issueId/:occurrenceId', authenticateToken, async (req, res) => {
  try {
    const { issueId, occurrenceId } = req.params;
    const { description } = req.body;

    // Update the specific occurrence using $set operator
    const updatedIssue = await Issue.findOneAndUpdate(
      { _id: issueId, 'occurrences._id': occurrenceId },
      { 
        $set: { 
          'occurrences.$.description': description,
          'occurrences.$.updated_at': Date.now()
        } 
      },
      { new: true, runValidators: false }
    );

    if (!updatedIssue) {
      return res.status(404).json({ message: 'Issue or occurrence not found' });
    }

    const updatedOccurrence = updatedIssue.occurrences.find(
      occ => occ._id.toString() === occurrenceId
    );

    res.json({ 
      message: 'Occurrence updated successfully', 
      occurrence: updatedOccurrence 
    });
  } catch (error) {
    console.error('Error updating occurrence:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

module.exports = router;
