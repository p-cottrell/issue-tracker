require('dotenv').config();
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');





// this is the route setting for the occurances, allows the user to add occurances to incidents that have alread
//been reported.
//gets the initial incident and pushes it into it


router.post(
  '/:issueId',
  authenticateToken,
  async (req, res) => {
    const { description } = req.body;
    const issueID = req.params.issueId.trim();

    try {
      // Find the related incident
      const issue = await Issue.findById(issueID);
      if (!issue) {
        console.log({incidentID});
        return res.status(404).json({ error: 'Issue not found'}); ;
      }

      // Create a new occurrence
      const newOccurrence = new Occurrence({
        user_id: req.user.id,
        description,
        created_at: Date.now(),
        updated_at: Date.now(),
      });

      await newOccurrence.save();

      // Add the occurrence to the incident's occurrences array
      issue.occurrences.push(newOccurrence._id);
      await incident.save();

      res.status(201).json({ message: 'Occurrence created', occurrenceId: newOccurrence._id });
    } catch (error) {
      res.status(500).json({ error: 'Error creating occurrence', details: error.message });
    }
  }
);
// find all occurances for a specific incident
router.get('/issues/:id/occurrences', authenticateToken, async (req, res) => {
  try {
    const issueID = req.params.id; 
    const issue = await Issue.findById(issueID);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    
    res.status(200).json(issue.occurrences);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching occurrences', details: error.message });
  }
});



router.delete('/issues/:issueId/occurrences/:occurrenceId', authenticateToken, async (req, res) => {
  try{
    const{issueId, occurrenceId} = req.params;
   

  const  issue = await Issue.findById(issueId);
  if(!issue){
    return res.status(404).json({error: 'Issue not found'});
  }
  const occurrence = issue.occurrences.id(occurrenceId);
  if (!occurrence){
    return res.status(404).json({error: 'Occurrence not found'}); 
   }
  if (occurrence.user_id.toString() !== req.user.id|| req.user.role !== 'admin'){
    return res.status(403).json({error: 'You are not authorised to delete this occurrence'});
    }
    occurrence.remove();

    await issue.save();
    res.status(200).json({message: 'Occurrence deleted'});
  } catch (error){
    res.status(500).json({error: 'Error deleting occurrence', details: error.message});


  }
}); 

module.exports = router;