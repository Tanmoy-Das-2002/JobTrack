import Application from '../models/Application.js';

/**
 * @desc    Get all applications for the logged-in user
 * @route   GET /api/applications
 * @access  Private
 */
export const getApplications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const applications = await Application.find({ user: userId }).sort({ createdAt: -1 });
    return res.json(applications);
  } catch (error) {
    console.error('Get Applications Error:', error);
    return res.status(500).json({ message: 'Server error retrieving applications: ' + error.message });
  }
};

/**
 * @desc    Get single application by ID
 * @route   GET /api/applications/:id
 * @access  Private
 */
export const getApplicationById = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const appId = req.params.id;

    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    // Check ownership
    if (application.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    return res.json(application);
  } catch (error) {
    console.error('Get Application By ID Error:', error);
    return res.status(500).json({ message: 'Server error retrieving application details' });
  }
};

/**
 * @desc    Create a new job application
 * @route   POST /api/applications
 * @access  Private
 */
export const createApplication = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      companyName,
      jobTitle,
      location,
      jobType,
      workMode,
      status,
      applicationDate,
      deadline,
      jobUrl,
      salary,
      notes,
    } = req.body;

    if (!companyName || !jobTitle) {
      return res.status(400).json({ message: 'Please provide required fields (Company Name and Job Title)' });
    }

    const application = await Application.create({
      user: userId,
      companyName,
      jobTitle,
      location: location || '',
      jobType: jobType || 'Full Time',
      workMode: workMode || 'On-site',
      status: status || 'Applied',
      applicationDate: applicationDate || new Date(),
      deadline: deadline || null,
      jobUrl: jobUrl || '',
      salary: salary || '',
      notes: notes || '',
      interviews: [],
    });

    return res.status(201).json(application);
  } catch (error) {
    console.error('Create Application Error:', error);
    return res.status(500).json({ message: 'Server error creating application: ' + error.message });
  }
};

/**
 * @desc    Update an existing job application
 * @route   PUT /api/applications/:id
 * @access  Private
 */
export const updateApplication = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const appId = req.params.id;

    let application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check user ownership
    if (application.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    // Whitelist allowed update fields to prevent mass assignment
    const allowedFields = [
      'companyName',
      'jobTitle',
      'location',
      'jobType',
      'workMode',
      'status',
      'salary',
      'jobUrl',
      'notes',
      'applicationDate',
      'deadline',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Prevent Mongoose CastError on empty date strings
        if ((field === 'deadline' || field === 'applicationDate') && req.body[field] === '') {
          updateData[field] = null;
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    // Update fields with whitelisted payload
    application = await Application.findByIdAndUpdate(appId, updateData, {
      new: true,
      runValidators: true,
    });

    return res.json(application);
  } catch (error) {
    console.error('Update Application Error:', error);
    return res.status(500).json({ message: 'Server error updating application: ' + error.message });
  }
};

/**
 * @desc    Delete a job application
 * @route   DELETE /api/applications/:id
 * @access  Private
 */
export const deleteApplication = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const appId = req.params.id;

    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check user ownership
    if (application.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this application' });
    }

    await application.deleteOne();
    return res.json({ message: 'Application deleted successfully', id: appId });
  } catch (error) {
    console.error('Delete Application Error:', error);
    return res.status(500).json({ message: 'Server error deleting application' });
  }
};

/**
 * @desc    Get statistics and metrics for applications
 * @route   GET /api/applications/stats
 * @access  Private
 */
export const getApplicationStats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const applications = await Application.find({ user: userId });

    const total = applications.length;
    const statusCounts = {
      Wishlist: 0,
      Applied: 0,
      'Online Assessment': 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      Withdrawn: 0,
    };

    let totalInterviewsScheduled = 0;

    applications.forEach((app) => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status] += 1;
      }
      if (app.interviews && Array.isArray(app.interviews)) {
        totalInterviewsScheduled += app.interviews.length;
      }
    });

    const activeApplications = total - (statusCounts.Rejected + statusCounts.Withdrawn);
    const offerRate = total > 0 ? ((statusCounts.Offer / total) * 100).toFixed(1) : '0';

    return res.json({
      total,
      activeApplications,
      statusCounts,
      totalInterviewsScheduled,
      offerRate: `${offerRate}%`,
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    return res.status(500).json({ message: 'Server error retrieving statistics' });
  }
};

/**
 * @desc    Add an interview round to an application
 * @route   POST /api/applications/:id/interviews
 * @access  Private
 */
export const addInterview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const appId = req.params.id;
    const { interviewDate, interviewType, interviewNotes, result } = req.body;

    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const newInterview = {
      interviewDate: interviewDate || new Date(),
      interviewType: interviewType || 'Technical',
      interviewNotes: interviewNotes || '',
      result: result || 'Pending',
    };

    application.interviews.push(newInterview);
    await application.save();

    return res.status(201).json(application);
  } catch (error) {
    console.error('Add Interview Error:', error);
    return res.status(500).json({ message: 'Server error adding interview round' });
  }
};

/**
 * @desc    Delete an interview round from an application
 * @route   DELETE /api/applications/:id/interviews/:interviewId
 * @access  Private
 */
export const deleteInterview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id: appId, interviewId } = req.params;

    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.interviews = application.interviews.filter(
      (item) => item._id && item._id.toString() !== interviewId
    );

    await application.save();
    return res.json(application);
  } catch (error) {
    console.error('Delete Interview Error:', error);
    return res.status(500).json({ message: 'Server error deleting interview' });
  }
};
