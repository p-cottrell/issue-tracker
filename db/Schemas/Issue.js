const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  reporter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status_id: {
    type: Number,
    ref: 'Status',
    required: true,
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
  occurrences: [
    {
      issue_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        required: true,
      },
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
    },
  ],
  attachments: [
    {
      issue_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        required: true,
      },
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
    },
  ],
  comments: [
    {
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
    },
  ],
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
