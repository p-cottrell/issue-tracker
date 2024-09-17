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
      const attachments = issue.attachments;

      const attachmentsWithSignedUrls = await Promise.all(attachments.map(async (attachment) => {
        try {
          if (!attachment.file_path || typeof attachment.file_path !== 'string' || !attachment.file_path.startsWith('s3://')) {
            console.error(`Invalid file_path for attachment ${attachment._id}: ${attachment.file_path}`);
            return null; // Skip this attachment
          }
  
          const bucketName = process.env.S3_BUCKET_NAME;
          const objectKey = attachment.file_path.replace('s3://', '');
  
          const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
          });
  
          const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
          return {
            ...attachment.toObject(),
            signedUrl,
          };
        } catch (error) {
          console.error(`Error processing attachment ${attachment._id}:`, error);
          return null; // Skip this attachment
        }
      }));
  
      // Filter out any null values (skipped attachments)
      const validAttachments = attachmentsWithSignedUrls.filter(attachment => attachment !== null);
  
      res.json(validAttachments);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      res.status(500).json({ message: 'Error fetching attachments', error: error.message });
    }
  });

router.post("/:issueId", authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

       

        const newAttachment = {
            user_id: req.user.id,
            file_path: req.file.location, // Store the full S3 URL
            title: req.body.title || 'Untitled', // Use the provided title or default to 'Untitled'
            created_at: new Date()
        };

        issue.attachments.push(newAttachment);
        await issue.save();

        // Generate signed URL for the new attachment
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: req.file.key,
        });
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        res.json({...newAttachment, signedUrl});
    } catch (error) {
        console.error('Error creating attachment:', error);
        res.status(500).json({ message: 'Server error' });
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
        if (req.user.role !== 'admin' && req.user.id !== attachment.user_id.toString()) {
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