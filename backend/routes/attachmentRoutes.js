require('dotenv').config();
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Issue = require('../models/Issue');
const { getSignedUrl } =require('@aws-sdk/s3-request-presigner');
const path = require('path');

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

      const attachmentsWithSignedUrls = await Promise.all(issue.attachments.map(async (attachment) => {
        const command = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: TrimStart(attachment.file_path, '/'), // Use the stored file_path directly
        });
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return { ...attachment.toObject(), signedUrl };
      }));

      res.json(attachmentsWithSignedUrls);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.post("/:issueId", authenticateToken, upload.array('file', 5), async (req, res) => {
    try {
        const { issueId } = req.params;
        const files = req.files || [];

        if (files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const issue = await Issue.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const newAttachments = files.map(file => ({
            user_id: req.user.id,
            file_path: file.key, // Use file.key for S3 uploads
            title: file.originalname || 'Untitled',
            created_at: new Date()
        }));

        issue.attachments.push(...newAttachments);
        await issue.save();

        // Generate signed URLs for the new attachments
        const attachmentsWithSignedUrls = await Promise.all(newAttachments.map(async (attachment) => {
            const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: TrimStart(attachment.file_path, '/'),
            });
            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            return { ...attachment, signedUrl };
        }));

        res.json(attachmentsWithSignedUrls);
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
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
            Key: TrimStart(attachment.file_path, '/'), // Use the file_path directly as the Key
        });

        await s3Client.send(deleteCommand);

        // Remove the attachment from the issue
        issue.attachments.splice(attachmentIndex, 1);
        await issue.save();

        res.json({ message: 'Attachment deleted successfully' });
    } catch (error) {
        console.error('Error deleting attachment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

function TrimStart(str, charlist) {
    if (charlist === undefined)
      charlist = "\s";
  let startIndex = 0;
  while (startIndex < str.length && charlist.indexOf(str[startIndex]) >= 0) {
    startIndex++;
  }
  return str.substr(startIndex);
}

router.get("/:issueId/signedUrls", authenticateToken, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const attachmentsWithSignedUrls = await Promise.all(issue.attachments.map(async (attachment) => {
            const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: TrimStart(attachment.file_path, '/').split('/').pop(), // Assuming file_path contains the full S3 URL
            });
            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            return { ...attachment.toObject(), signedUrl };
        }));

        res.json(attachmentsWithSignedUrls);
    } catch (error) {
        console.error('Error fetching signed URLs:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;