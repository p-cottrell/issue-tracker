const express = require('express');
const mongoose = require('mongoose');
const authenticateToken = require('../middleware/authenticateToken');
const Incident = require('../models/Incident');

const router = express.Router();

router.post('/incident', authenticateToken, async (req, res) => {
  const { description, location } = req.body;
  const userID = req.user.userID;
  const incident = new Incident({ userID, description, location });
  try {
    await incident.save();
    res.status(201).send('Incident created' );
  } catch (error) {
    res.status(500).send('Error creating incident' );
  }
});

router.get('/incidents', authenticateToken, async (req, res) => {

 try{ 
  const incidents = await Incident.find({ userID: req.user.userID });
  res.send(incidents);
 } catch (error) {
  res.status(500).send('Error fetching incidents');
 }
});


router.put('/incidents/:id', authenticateToken, async (req, res) => {
  const { description, location } = req.body;
  try{
    const incident = await Incident.findById(req.params.id);
    if (!incident){
      return res.status(404).send('Incident not found');
    }
    if (incident.userID.toString() !== req.user.userID){
      return res.status(403).send('Not authorized');
    }
    incident.description = description;
    incident.location = location;
    await incident.save();

    res.send('Incident updated'); 
  }catch (error){
    res.status(400).send('Error updating incident');  
  }

}); 





router.get('/incidents/:id', authenticateToken, async (req, res) => {
 
  try {
    const incident = Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).send('Incident not found');
    }
    if (incident.userID !== req.user.userID) {
      return res.status(403).send('Unauthorized');
    }
  } catch (error) {
    res.status(500).send('Error fetching incident');
  }
}); 

router.delete('/incidents/:id', authenticateToken, async (req, res) => {
  try{
    const incident = await Incident.findById(req.params.id);
    if (!incident){
      return res.syatus(404).send("incident not found");
    }
    if (incident.userID.toString() !== req.user.userID){
      return res.status(403).send('Not authorized');
    }

    await Incident.findByIdAndDelete(req.params.id);
    res.send('Incident deleted'); 
  }
      catch (error) {
      res.status(500).send('Error deleting incident');
    }
  }); 
  
    
  

module.exports = router;