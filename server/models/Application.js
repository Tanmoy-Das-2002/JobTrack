import mongoose from 'mongoose';

/**
 * Application Schema for JobTrack
 * Represents a student's job application, including company info, status,
 * key dates, compensation, notes, and interview details.
 */
const interviewSchema = new mongoose.Schema({
  interviewDate: {
    type: Date,
  },
  interviewType: {
    type: String,
    enum: ['Technical', 'HR', 'Managerial', 'Online Assessment', 'Other'],
    default: 'Technical',
  },
  interviewNotes: {
    type: String,
    default: '',
  },
  result: {
    type: String,
    enum: ['Pending', 'Passed', 'Failed'],
    default: 'Pending',
  },
});

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please add a company name'],
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['Full Time', 'Internship', 'Part Time'],
      default: 'Full Time',
    },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'On-site',
    },
    status: {
      type: String,
      enum: [
        'Wishlist',
        'Applied',
        'Online Assessment',
        'Interview',
        'Offer',
        'Rejected',
        'Withdrawn',
      ],
      default: 'Applied',
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
    },
    jobUrl: {
      type: String,
      default: '',
      trim: true,
    },
    salary: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    interviews: [interviewSchema],
  },
  {
    timestamps: true,
  }
);

const Application =
  mongoose.models.Application ||
  mongoose.model('Application', applicationSchema);

export default Application;
