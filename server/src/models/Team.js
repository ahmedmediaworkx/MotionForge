import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'viewer'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'declined'],
    default: 'pending'
  },
  inviteToken: {
    type: String,
    default: ''
  },
  invitedAt: {
    type: Date,
    default: Date.now
  },
  joinedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
teamSchema.index({ owner: 1 });
teamSchema.index({ email: 1 });
teamSchema.index({ member: 1 });

const Team = mongoose.model('Team', teamSchema);

export default Team;