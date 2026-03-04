import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      elements: [],
      settings: {
        width: 1920,
        height: 1080,
        backgroundColor: '#080C10',
        frameRate: 30,
        duration: 5
      }
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
projectSchema.index({ user: 1, createdAt: -1 });
projectSchema.index({ user: 1, status: 1 });

// Virtual for export count
projectSchema.virtual('exportCount', {
  ref: 'Export',
  localField: '_id',
  foreignField: 'project',
  count: true
});

const Project = mongoose.model('Project', projectSchema);

export default Project;