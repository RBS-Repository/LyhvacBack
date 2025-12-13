import asyncHandler from 'express-async-handler';
import User from '../models/userModel';
import SignupAttempt from '../models/signupAttemptModel';

// @desc    Get all users
// @route   GET /api/users
// @access  Admin (for now, public for testing)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get or create user by Firebase UID
// @route   GET /api/users/uid/:uid
// @access  Public
const getUserByFirebaseUID = asyncHandler(async (req, res) => {
  const user = await User.findOne({ firebaseUID: req.params.uid });

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Create a new user
// @route   POST /api/users
// @access  Public
const createUser = asyncHandler(async (req, res) => {
  const { firebaseUID, email, displayName } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Check for signup attempts and rate limiting
  const existingAttempt = await SignupAttempt.findOne({ email });
  
  if (existingAttempt) {
    // Check if blocked
    if (existingAttempt.isBlocked && existingAttempt.blockUntil) {
      const now = new Date();
      if (now < existingAttempt.blockUntil) {
        res.status(429);
        throw new Error('Too many signup attempts. Please try again later.');
      } else {
        // Block expired, reset
        existingAttempt.attemptCount = 0;
        existingAttempt.isBlocked = false;
        existingAttempt.blockUntil = undefined;
        await existingAttempt.save();
      }
    }
    
    // Increment attempt count
    existingAttempt.attemptCount += 1;
    existingAttempt.lastAttempt = new Date();
    
    // Block if 5+ attempts in short time
    if (existingAttempt.attemptCount >= 5) {
      const timeSinceFirst = existingAttempt.lastAttempt.getTime() - existingAttempt.createdAt.getTime();
      const oneHour = 60 * 60 * 1000;
      
      if (timeSinceFirst < oneHour) {
        existingAttempt.isBlocked = true;
        existingAttempt.blockUntil = new Date(Date.now() + 15 * 60 * 1000); // Block for 15 minutes
        await existingAttempt.save();
        res.status(429);
        throw new Error('Too many signup attempts. Please try again in 15 minutes.');
      }
    }
    
    await existingAttempt.save();
  } else {
    // First attempt
    await SignupAttempt.create({
      email,
      ipAddress,
      attemptCount: 1,
      lastAttempt: new Date(),
    });
  }

  const user = new User({
    firebaseUID,
    email,
    displayName: displayName || '',
    isDisabled: true, // New users are disabled by default until admin approval
  });

  const createdUser = await user.save();
  
  // Clear signup attempts on successful signup
  await SignupAttempt.deleteOne({ email });
  
  res.status(201).json(createdUser);
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = asyncHandler(async (req, res) => {
  const { displayName, isDisabled, disabledBy, reason } = req.body;

  const user = await User.findById(req.params.id);

  if (user) {
    user.displayName = displayName || user.displayName;
    
    // Handle disable/enable
    if (typeof isDisabled === 'boolean') {
      user.isDisabled = isDisabled;
      
      if (isDisabled) {
        user.disabledAt = new Date();
        user.disabledBy = disabledBy || '';
        user.reason = reason || '';
      } else {
        user.disabledAt = undefined as any;
        user.disabledBy = '';
        user.reason = '';
      }
    }
    
    user.updatedAt = new Date();

    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Disable user
// @route   PUT /api/users/:id/disable
// @access  Admin
const disableUser = asyncHandler(async (req, res) => {
  const { disabledBy, reason } = req.body;

  const user = await User.findById(req.params.id);

  if (user) {
    user.isDisabled = true;
    user.disabledAt = new Date();
    user.disabledBy = disabledBy || '';
    user.reason = reason || '';
    user.updatedAt = new Date();

    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Enable user
// @route   PUT /api/users/:id/enable
// @access  Admin
const enableUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isDisabled = false;
    user.disabledAt = undefined as any;
    user.disabledBy = '';
    user.reason = '';
    user.updatedAt = new Date();

    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  getUsers,
  getUserById,
  getUserByFirebaseUID,
  createUser,
  updateUser,
  disableUser,
  enableUser,
  deleteUser,
};

