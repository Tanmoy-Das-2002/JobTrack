import express from 'express';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationStats,
  addInterview,
  deleteInterview,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes in this router require authentication
router.use(protect);

/**
 * @route   GET /api/applications/stats
 * @desc    Get metrics and application statistics
 */
router.get('/stats', getApplicationStats);

/**
 * @route   GET /api/applications
 * @desc    Get all job applications for logged-in user
 */
/**
 * @route   POST /api/applications
 * @desc    Create a new job application
 */
router.route('/').get(getApplications).post(createApplication);

/**
 * @route   POST /api/applications/:id/interviews
 * @desc    Add an interview round to an application
 */
router.post('/:id/interviews', addInterview);

/**
 * @route   DELETE /api/applications/:id/interviews/:interviewId
 * @desc    Delete an interview round
 */
router.delete('/:id/interviews/:interviewId', deleteInterview);

/**
 * @route   GET /api/applications/:id
 * @desc    Get application by ID
 */
/**
 * @route   PUT /api/applications/:id
 * @desc    Update application
 */
/**
 * @route   DELETE /api/applications/:id
 * @desc    Delete application
 */
router
  .route('/:id')
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

export default router;
