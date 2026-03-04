import express from 'express';
import { z } from 'zod';
import Export from '../models/Export.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { protect, requirePlan } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/exports
// @desc    Get all exports for current user
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { projectId, format, status, page = 1, limit = 12 } = req.query;

  // Build query
  const query = { user: req.user._id };
  
  if (projectId) query.project = projectId;
  if (format) query.format = format;
  if (status) query.status = status;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get exports
  const exports = await Export.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit))
    .populate('project', 'name thumbnail');

  const total = await Export.countDocuments(query);

  res.json({
    success: true,
    data: {
      exports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   POST /api/exports
// @desc    Create a new export
// @access  Private
const createExportSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  format: z.enum(['gif', 'mp4', 'json', 'png']),
  quality: z.enum(['low', 'medium', 'high', 'original']).default('high'),
  width: z.number().optional(),
  height: z.number().optional()
});

router.post('/', protect, asyncHandler(async (req, res) => {
  const validatedData = createExportSchema.parse(req.body);
  const { projectId, format, quality, width, height } = validatedData;

  // Verify project exists and belongs to user
  const project = await Project.findOne({
    _id: projectId,
    user: req.user._id
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Check export limit
  if (req.user.exportCount >= req.user.exportLimit) {
    return res.status(403).json({
      success: false,
      message: 'Export limit reached. Upgrade to create more exports.',
      limit: req.user.exportLimit,
      current: req.user.exportCount
    });
  }

  // Check MP4 format for free users
  if (format === 'mp4' && req.user.plan === 'free') {
    return res.status(403).json({
      success: false,
      message: 'MP4 export requires Pro plan or higher',
      requiredPlan: 'pro'
    });
  }

  // Create export record
  const exportRecord = await Export.create({
    user: req.user._id,
    project: projectId,
    format,
    quality,
    width: width || 1920,
    height: height || 1080,
    status: 'completed', // For MVP, mark as completed directly
    url: `https://res.cloudinary.com/demo/video/upload/sample.${format === 'json' ? 'json' : format}`
  });

  // Increment user's export count
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { exportCount: 1 }
  });

  res.status(201).json({
    success: true,
    data: { export: exportRecord },
    message: 'Export created successfully'
});
}));

// @route   GET /api/exports/:id
// @desc    Get single export
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const exportRecord = await Export.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate('project', 'name thumbnail');

  if (!exportRecord) {
    return res.status(404).json({
      success: false,
      message: 'Export not found'
    });
  }

  res.json({
    success: true,
    data: { export: exportRecord }
  });
}));

// @route   DELETE /api/exports/:id
// @desc    Delete export
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const exportRecord = await Export.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!exportRecord) {
    return res.status(404).json({
      success: false,
      message: 'Export not found'
    });
  }

  res.json({
    success: true,
    message: 'Export deleted successfully'
  });
}));

// @route   GET /api/exports/stats
// @desc    Get export statistics
// @access  Private
router.get('/stats/overview', protect, asyncHandler(async (req, res) => {
  const totalExports = await Export.countDocuments({ user: req.user._id });
  
  // This month's exports
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const thisMonthExports = await Export.countDocuments({
    user: req.user._id,
    createdAt: { $gte: startOfMonth }
  });

  // By format
  const byFormat = await Export.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: '$format', count: { $sum: 1 } } }
  ]);

  res.json({
    success: true,
    data: {
      totalExports,
      thisMonthExports,
      exportLimit: req.user.exportLimit,
      exportCount: req.user.exportCount,
      byFormat: byFormat.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    }
  });
}));

export default router;