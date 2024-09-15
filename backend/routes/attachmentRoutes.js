require('dotenv').config();
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Issue = require('../models/Issue');

// Configure AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});



// Configure multer for S3 upload
const upload = multer({
    storage: multerS3({
      s3: (req) => req.s3Client, // Use the S3 client from the request object
      bucket: process.env.S3_BUCKET_NAME,
      key: function (req, file, cb) {
        cb(null, 'attachments/' + Date.now().toString() + '-' + file.originalname)
      }
    })
  });

router.get("/api/attachments/:issueId", authenticateToken, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.json(issue.attachments);
    } catch (error) {
        console.error('Error fetching attachments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post("/api/attachments/:issueId", authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const newAttachment = {
            user_id: req.user.id,
            file_path: req.file.location // S3 URL of the uploaded file
        };

        issue.attachments.push(newAttachment);
        await issue.save();

        res.json(newAttachment);
    } catch (error) {
        console.error('Error creating attachment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete("/api/attachments/:issueId/:attachmentId", authenticateToken, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const attachmentIndex = issue.attachments.findIndex(
            attachment => attachment._id.toString() === req.params.attachmentId
        );

        if (attachmentIndex === -1) {
            return res.status(404).json({ message: 'Attachment not found' });
        }

        // Remove the attachment from S3
        const attachmentToDelete = issue.attachments[attachmentIndex];
        await s3.deleteObject({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: attachmentToDelete.file_path.split('/').pop()
        }).promise();

        // Remove the attachment from the issue
        issue.attachments.splice(attachmentIndex, 1);
        await issue.save();

        res.json({ message: 'Attachment deleted' });
    } catch (error) {
        console.error('Error deleting attachment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;