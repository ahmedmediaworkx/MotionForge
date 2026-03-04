import express from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { protect, requirePlan } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/team
// @desc    Get team members
// @access  Private (Agency only)
router.get('/', protect, requirePlan('agency'), asyncHandler(async (req, res) => {
  const teamMembers = await Team.find({ owner: req.user._id })
    .populate('member', 'name email avatar')
    .sort('-createdAt');

  res.json({
    success: true,
    data: { teamMembers }
  });
}));

// @route   POST /api/team/invite
// @desc    Invite a team member
// @access  Private (Agency only)
const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'editor', 'viewer']).default('viewer')
});

router.post('/invite', protect, requirePlan('agency'), asyncHandler(async (req, res) => {
  const validatedData = inviteSchema.parse(req.body);
  const { email, role } = validatedData;

  // Check if user is inviting themselves
  if (email === req.user.email) {
    return res.status(400).json({
      success: false,
      message: 'You cannot invite yourself'
    });
  }

  // Check if already a team member
  const existingMember = await Team.findOne({
    owner: req.user._id,
    email: email
  });

  if (existingMember) {
    return res.status(400).json({
      success: false,
      message: 'This user is already in your team'
    });
  }

  // Check team limit (10 members for agency)
  const teamCount = await Team.countDocuments({ owner: req.user._id, status: 'active' });
  if (teamCount >= 10) {
    return res.status(403).json({
      success: false,
      message: 'Team limit reached (10 members)'
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  // Create invite
  const inviteToken = uuidv4();
  
  const teamMember = await Team.create({
    owner: req.user._id,
    member: existingUser?._id,
    email,
    role,
    inviteToken,
    status: existingUser ? 'active' : 'pending',
    joinedAt: existingUser ? new Date() : undefined
  });

  // TODO: Send invitation email
  // await sendInviteEmail(email, inviteToken, req.user.name);

  res.status(201).json({
    success: true,
    data: { 
      teamMember: await teamMember.populate('member', 'name email avatar')
    },
    message: existingUser ? 'Team member added' : 'Invitation sent'
  });
}));

// @route   PUT /api/team/:id
// @desc    Update team member role
// @access  Private (Agency only)
router.put('/:id', protect, requirePlan('agency'), asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['admin', 'editor', 'viewer'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  const teamMember = await Team.findOne({
    _id: req.params.id,
    owner: req.user._id
  });

  if (!teamMember) {
    return res.status(404).json({
      success: false,
      message: 'Team member not found'
    });
  }

  teamMember.role = role;
  await teamMember.save();

  res.json({
    success: true,
    data: { teamMember },
    message: 'Role updated successfully'
  });
}));

// @route   DELETE /api/team/:id
// @desc    Remove team member
// @access  Private (Agency only)
router.delete('/:id', protect, requirePlan('agency'), asyncHandler(async (req, res) => {
  const teamMember = await Team.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id
  });

  if (!teamMember) {
    return res.status(404).json({
      success: false,
      message: 'Team member not found'
    });
  }

  res.json({
    success: true,
    message: 'Team member removed'
  });
}));

// @route   POST /api/team/accept
// @desc    Accept team invitation
// @access  Private
router.post('/accept', protect, asyncHandler(async (req, res) => {
  const { token } = req.body;

  const teamMember = await Team.findOne({
    inviteToken: token,
    email: req.user.email,
    status: 'pending'
  });

  if (!teamMember) {
    return res.status(404).json({
      success: false,
      message: 'Invalid or expired invitation'
    });
  }

  teamMember.member = req.user._id;
  teamMember.status = 'active';
  teamMember.joinedAt = new Date();
  teamMember.inviteToken = '';
  await teamMember.save();

  res.json({
    success: true,
    data: { teamMember },
    message: 'You have joined the team'
  });
}));

export default router;