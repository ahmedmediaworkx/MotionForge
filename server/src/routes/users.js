import express from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        exportCount: user.exportCount,
        exportLimit: user.exportLimit,
        projectLimit: user.projectLimit,
        notifications: user.notifications,
        createdAt: user.createdAt
      }
    }
  });
}));

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  notifications: z.object({
    email: z.boolean().optional(),
    marketing: z.boolean().optional()
  }).optional()
});

router.put('/me', protect, asyncHandler(async (req, res) => {
  const validatedData = updateProfileSchema.parse(req.body);
  
  const { name, avatar, notifications } = validatedData;
  
  const updateData = {};
  if (name) updateData.name = name;
  if (avatar !== undefined) updateData.avatar = avatar;
  if (notifications) updateData.notifications = notifications;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: {
      user: user.getPublicProfile()
    },
    message: 'Profile updated successfully'
  });
}));

// @route   PUT /api/users/me/password
// @desc    Change password
// @access  Private
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

router.put('/me/password', protect, asyncHandler(async (req, res) => {
  const validatedData = changePasswordSchema.parse(req.body);
  const { currentPassword, newPassword } = validatedData;

  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// @route   DELETE /api/users/me
// @desc    Delete account
// @access  Private
router.delete('/me', protect, asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
}));

export default router;