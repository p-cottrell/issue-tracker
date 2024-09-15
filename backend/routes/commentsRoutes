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
 
  
  const { comment_text } = req.body;
  const issueId = req.params.issueId;
  const userId = req.user ? req.user.id : null;


  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const newComment = {
      user_id: userId,
      comment_text,
    };

    

    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      { $push: { comments: newComment } },
      { new: true, runValidators: true }
    );

    if (!updatedIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const addedComment = updatedIssue.comments[updatedIssue.comments.length - 1];

    res.status(201).json({ message: 'Comment added', comment: addedComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Error adding comment', details: error.message });
  }
});

/**
 * Route to retrieve all comments for a specific issue
 *
 * This route allows an authenticated user to retrieve all comments associated 
 * with a specific issue. The issue is identified by `issueId`, and the comments 
 * are returned in the response.
 *
 * @name GET /issues/:id/comments
 * @function
 * @memberof module:routes/comments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {404} - If the issue is not found.
 * @throws {500} - If an error occurs while fetching the occurrences.
 */
router.get('/issues/:id/comments', authenticateToken, async (req, res) => {
  try {
    const issueID = req.params.id;
    const issue = await Issue.findById(issueID);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Return the occurrences array directly, since it's an embedded subdocument
    res.status(200).json(issue.comments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching comments', details: error.message });
  }
});

/**
 * Route to delete a specific comment from an issue
 *
 * This route allows an authenticated user to delete a specific comment from an 
 * issue. The issue is identified by `issueId` and the comment by `commentId`.
 * Only the user who created the comment or an admin can delete it.
 *
 * @name DELETE /:issueId/:commentId
 * @function
 * @memberof module:routes/comments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {404} - If the issue or occurrence is not found.
 * @throws {403} - If the user is not authorized to delete the comment.
 * @throws {500} - If an error occurs while deleting the comment.
 */
router.delete('/:issueId/:commentId', authenticateToken, async (req, res) => {
    const { issueId, commentId } = req.params;
    const userId = req.user.id;
  
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }
  
      const comment = issue.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }
  
      if (comment.user_id.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this comment' });
      }
  
      issue.comments.pull(commentId);
      await issue.save();
  
      res.json({ message: 'Comment deleted' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Error deleting comment', details: error.message });
    }
  });
/**
 * Route to update a specific comment for an issue
 *
 * This route allows an authenticated user to update the description of a specific comment
 * within an issue. The issue is identified by `issueId` and the comment by `commentId`.
 * The updated description is provided in the request body.
 *
 * @name PUT /:issueId/:commentId
 * @function
 * @memberof module:routes/comments
 * @param {Object} req.body - The updated comment data (description).
 * @param {Object} res - The response object.
 * @throws {404} - If the issue or comment is not found.
 * @throws {500} - If an error occurs while updating the comment.
 */

router.put('/:issueId/:commentId', authenticateToken, async (req, res) => {
  try {
    const { issueId, commentId } = req.params;
    const { comment_text } = req.body;

    // Update the specific comment using $set operator
    const updatedIssue = await Issue.findOneAndUpdate(
      { _id: issueId, 'comments._id': commentId },
      { 
        $set: { 
          'comments.$.comment_text': comment_text,
          'comments.$.updated_at': Date.now()
        } 
      },
      { new: true, runValidators: false }
    );

    if (!updatedIssue) {
      return res.status(404).json({ message: 'Issue or comment not found' });
    }

    const updatedComment = updatedIssue.comments.find(
      comment => comment._id.toString() === commentId
    );

    res.json({ 
      message: 'Comment updated successfully', 
      comment: updatedComment 
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

module.exports = router;
