import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'agency'],
    default: 'free'
  },
  stripeCustomerId: {
    type: String,
    default: ''
  },
  stripeSubscriptionId: {
    type: String,
    default: ''
  },
  refreshToken: {
    type: String,
    select: false
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  exportCount: {
    type: Number,
    default: 0
  },
  exportLimit: {
    type: Number,
    default: 5
  },
  projectLimit: {
    type: Number,
    default: 3
  },
  notifications: {
    email: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    plan: this.plan,
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

export default User;