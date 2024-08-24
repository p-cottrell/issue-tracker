const mongoose = require('mongoose');

const occurrenceSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  },
});

const attachmentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  file_path: {
    type: String,
    required: true,
    maxlength: 255,
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
});

const commentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comment_text: {
    type: String,
    required: true,
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
});

const issueSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  reporter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status_id: {
    type: Number,
    ref: 'Status',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  charm: {
    type: String,
    required: true,
    maxlength: 1,
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  },
  occurrences: [occurrenceSchema], // Embedded occurrences subdocuments
  attachments: [attachmentSchema], // Embedded attachments subdocuments
  comments: [commentSchema], // Embedded comments subdocuments
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
