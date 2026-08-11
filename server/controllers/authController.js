import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Generate JWT signed token with user ID payload
 */
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new student user account
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, college, degree, graduationYear } = req.body;

    // 1. Validation checks
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (Name, Email, Password)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if user already exists in MongoDB
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // 3. Create user in MongoDB via Mongoose (triggers pre-save password hash hook)
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      college: college || '',
      degree: degree || '',
      graduationYear: graduationYear || '',
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        degree: user.degree,
        graduationYear: user.graduationYear,
        profilePicture: user.profilePicture,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ message: 'Server error during registration: ' + error.message });
  }
};

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user in MongoDB
    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        degree: user.degree,
        graduationYear: user.graduationYear,
        profilePicture: user.profilePicture,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login: ' + error.message });
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private (Requires Bearer token)
 */
export const getMe = async (req, res) => {
  try {
    // req.user is populated by protect middleware from MongoDB
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};
