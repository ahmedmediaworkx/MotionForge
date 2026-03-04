import express from 'express';
import { z } from 'zod';
import Project from '../models/Project.js';
import { protect, requirePlan } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects for current user
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { status, search, sort = '-createdAt', page = 1, limit = 12 } = req.query;

  // Build query
  const query = { user: req.user._id };
  
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get projects
  const projects = await Project.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('user', 'name email');

  const total = await Project.countDocuments(query);

  res.json({
    success: true,
    data: {
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/projects/stats
// @desc    Get project statistics
// @access  Private
router.get('/stats', protect, asyncHandler(async (req, res) => {
  const totalProjects = await Project.countDocuments({ user: req.user._id });
  const draftProjects = await Project.countDocuments({ user: req.user._id, status: 'draft' });
  const publishedProjects = await Project.countDocuments({ user: req.user._id, status: 'published' });

  // Get this month's exports
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const Export = req.app.locals.Export || (await import('../models/Export.js')).default;
  const thisMonthExports = await Export.countDocuments({
    user: req.user._id,
    createdAt: { $gte: startOfMonth }
  });

  res.json({
    success: true,
    data: {
      totalProjects,
      draftProjects,
      publishedProjects,
      thisMonthExports,
      projectLimit: req.user.projectLimit,
      exportLimit: req.user.exportLimit,
      exportCount: req.user.exportCount,
      plan: req.user.plan
    }
  });
}));

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  data: z.object({
    elements: z.array(z.any()).optional(),
    settings: z.object({
      width: z.number().optional(),
      height: z.number().optional(),
      backgroundColor: z.string().optional(),
      frameRate: z.number().optional(),
      duration: z.number().optional()
    }).optional()
  }).optional()
});

router.post('/', protect, asyncHandler(async (req, res) => {
  // Check project limit for free users
  if (req.user.plan === 'free') {
    const projectCount = await Project.countDocuments({ user: req.user._id });
    if (projectCount >= req.user.projectLimit) {
      return res.status(403).json({
        success: false,
        message: 'Project limit reached. Upgrade to Pro to create unlimited projects.',
        limit: req.user.projectLimit,
        current: projectCount
      });
    }
  }

  const validatedData = createProjectSchema.parse(req.body);
  const { name, description, data } = validatedData;

  const project = await Project.create({
    user: req.user._id,
    name,
    description: description || '',
    data: data || {
      elements: [],
      settings: {
        width: 1920,
        height: 1080,
        backgroundColor: '#080C10',
        frameRate: 30,
        duration: 5
      }
    }
  });

  res.status(201).json({
    success: true,
    data: { project },
    message: 'Project created successfully'
  });
}));

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  res.json({
    success: true,
    data: { project }
  });
}));

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  thumbnail: z.string().url().optional().or(z.literal('')),
  data: z.object({
    elements: z.array(z.any()).optional(),
    settings: z.object({
      width: z.number().optional(),
      height: z.number().optional(),
      backgroundColor: z.string().optional(),
      frameRate: z.number().optional(),
      duration: z.number().optional()
    }).optional()
  }).optional(),
  status: z.enum(['draft', 'published']).optional()
});

router.put('/:id', protect, asyncHandler(async (req, res) => {
  const validatedData = updateProjectSchema.parse(req.body);

  let project = await Project.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Update fields
  const updateData = { ...validatedData };
  project = await Project.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: { project },
    message: 'Project updated successfully'
  });
}));

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const project = await Project.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Delete associated exports
  const Export = req.app.locals.Export || (await import('../models/Export.js')).default;
  await Export.deleteMany({ project: req.params.id });

  res.json({
    success: true,
    message: 'Project deleted successfully'
  });
}));

// @route   POST /api/projects/:id/duplicate
// @desc    Duplicate project
// @access  Private
router.post('/:id/duplicate', protect, asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Check limit for free users
  if (req.user.plan === 'free') {
    const projectCount = await Project.countDocuments({ user: req.user._id });
    if (projectCount >= req.user.projectLimit) {
      return res.status(403).json({
        success: false,
        message: 'Project limit reached. Upgrade to Pro to create unlimited projects.',
        limit: req.user.projectLimit,
        current: projectCount
      });
    }
  }

  const newProject = await Project.create({
    user: req.user._id,
    name: `${project.name} (Copy)`,
    description: project.description,
    thumbnail: project.thumbnail,
    data: project.data,
    status: 'draft'
  });

  res.status(201).json({
    success: true,
    data: { project: newProject },
    message: 'Project duplicated successfully'
  });
}));

export default router;