import mongoose from 'mongoose';

const exportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  format: {
    type: String,
    enum: ['gif', 'mp4', 'json', 'png'],
    required: true
  },
  quality: {
    type: String,
    enum: ['low', 'medium', 'high', 'original'],
    default: 'high'
  },
  width: {
    type: Number,
    default: 1920
  },
  height: {
    type: Number,
    default: 1080
  },
  url: {
    type: String,
    default: ''
  },
  publicId: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
exportSchema.index({ user: 1, createdAt: -1 });
exportSchema.index({ project: 1 });

const Export = mongoose.model('Export', exportSchema);

export default Export;