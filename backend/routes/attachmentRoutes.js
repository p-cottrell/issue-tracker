require('dotenv').config();
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Issue = require('../models/Issue');
const { getSignedUrl } =require('@aws-sdk/s3-request-presigner');


// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME,
    key: function (req, file, cb) {
      const key = 'attachments/' + Date.now().toString() + '-' + file.originalname;
 
      cb(null, key);
    }
  })
});

router.get("/:issueId", authenticateToken, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        // Generate signed URLs for each attachment
            const attachmentsWithSignedUrls = await Promise.all(issue.attachments.map(async (attachment) => {
            const fullUrl = new URL(attachment.file_path);
            const key = fullUrl.pathname.slice(1); // Remove leading '/'
          
            const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: key,
            });
            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            return {
                ...attachment.toObject(),
                signedUrl,
            };
        }));

        res.json(attachmentsWithSignedUrls);
    } catch (error) {
        console.error('Error fetching attachments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to create a new issue and upload attachment
router.post("/", authenticateToken, upload.single('file'), async (req, res) => {
    try {
      const { title, description, charm } = req.body;
  
      // Validate required fields
      if (!title || !description) {
        return res.status(400).send({ message: 'Title and description are required.' });
      }
  
      // Create a new issue
      const newIssue = new Issue({
        reporter_id: req.user.userID,
        title,
        description,
        charm,
        created_at: new Date(),
      });
  
      // If a file is uploaded, handle the attachment
      if (req.file) {
        const newAttachment = {
          user_id: req.user.userID,
          file_path: req.file.location, // Store the full S3 URL
          title: req.body.attachmentTitle || 'Untitled',
          created_at: new Date(),
        };
  
        newIssue.attachments.push(newAttachment);
      }
  
      await newIssue.save();
  
      // Generate a signed URL for the uploaded attachment, if any
      let signedUrl = null;
      if (req.file) {
        const command = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: req.file.key,
        });
        signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      }
  
      res.status(201).json({
        message: 'Issue created successfully',
        issueID: newIssue._id,
        attachment: signedUrl ? { signedUrl } : undefined,
      });
    } catch (error) {
      console.error('Error creating issue:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  });

router.delete("/:issueId/:attachmentId", authenticateToken, async (req, res) => {
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

        const attachment = issue.attachments[attachmentIndex];

        // Check if the user is authorized to delete the attachment
        if (req.user.role !== 'admin' && req.user.userID !== attachment.user_id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this attachment' });
        }

        // Delete the file from S3
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: new URL(attachment.file_path).pathname.slice(1), // Remove leading '/'
        });

        await s3Client.send(deleteCommand);

        // Remove the attachment from the issue
        issue.attachments.splice(attachmentIndex, 1);
        await issue.save();

        res.json({ message: 'Attachment deleted successfully' });
    } catch (error) {
        console.error('Error deleting attachment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;