const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Task = require('../models/Task');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Get all users with their task statistics
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    // Get task statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const tasks = await Task.find({ assignedTo: user._id });
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const ongoingTasks = tasks.filter(task => task.status === 'in_progress').length;
        const totalTasks = tasks.length;
        
        return {
          ...user.toObject(),
          taskStats: {
            total: totalTasks,
            completed: completedTasks,
            ongoing: ongoingTasks,
            completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
          }
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'employee',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'tasks',
        select: 'title description status priority startDate dueDate completedAt',
        options: { sort: { 'dueDate': 1 } }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get task statistics
    const tasks = user.tasks || [];
    const stats = {
      total: tasks.length,
      completed: tasks.filter(task => task.status === 'completed').length,
      inProgress: tasks.filter(task => task.status === 'in_progress').length,
      pending: tasks.filter(task => task.status === 'pending').length
    };

    const response = {
      ...user.toObject(),
      stats
    };

    res.json(response);
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    // Only allow users to update their own profile unless they're an admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user account
// @route   PUT /api/users/:id/deactivate
// @access  Private
const deactivateUser = async (req, res) => {
  try {
    // Only allow users to delete their own account unless they're an admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find all tasks assigned to this user
    const tasks = await Task.find({ assignedTo: user._id });

    // If there are tasks, handle them based on user role
    if (tasks.length > 0) {
      if (req.user.role === 'admin') {
        // For admin, delete all tasks associated with the user
        await Task.deleteMany({ assignedTo: user._id });
      } else {
        // For non-admin users, can't delete account if they have active tasks
        const activeTasks = tasks.filter(task => task.status !== 'completed');
        if (activeTasks.length > 0) {
          return res.status(400).json({ 
            message: 'Cannot delete account while having active tasks. Please complete or reassign your tasks first.' 
          });
        }
        // Delete only completed tasks
        await Task.deleteMany({ assignedTo: user._id, status: 'completed' });
      }
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    // If user deleted their own account, clear their token
    if (req.user._id.toString() === req.params.id) {
      res.clearCookie('token');
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error in deactivateUser:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  getUserProfile,
  updateUser,
  deactivateUser,
}; 