const Task = require('../models/Task');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ updatedAt: -1 }); // Sort by most recently updated
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, startDate, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      assignedTo: req.user._id, // Assign to the current user by default
      priority,
      status,
      startDate,
      dueDate,
      createdBy: req.user._id,
      updatedAt: new Date(),
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Allow admin to update any task, otherwise check if user is creator or assigned user
    if (
      req.user.role !== 'admin' &&
      task.createdBy.toString() !== req.user._id.toString() &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // If status is being changed and user is not admin, set it as pending
    if (req.body.status && req.user.role !== 'admin') {
      const updateData = {
        ...req.body,
        pendingStatus: {
          requestedStatus: req.body.status,
          requestedBy: req.user._id,
          requestedAt: new Date(),
        },
        updatedAt: new Date(),
      };
      delete updateData.status; // Remove the status from the update as it will be pending

      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      )
        .populate('assignedTo', 'firstName lastName')
        .populate('createdBy', 'firstName lastName')
        .populate('pendingStatus.requestedBy', 'firstName lastName');

      return res.json(updatedTask);
    }

    // For admins or non-status updates, proceed with normal update
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        updatedAt: new Date(),
        // If status is being changed to completed, set completedAt
        ...(req.body.status === 'completed' && { completedAt: new Date() }),
        // Clear pending status if admin is updating status
        ...(req.body.status && { pendingStatus: null })
      },
      { new: true }
    )
      .populate('assignedTo', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('pendingStatus.requestedBy', 'firstName lastName');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Allow admin to delete any task, otherwise only creator can delete
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve a pending status change
// @route   PUT /api/tasks/:id/approve-status
// @access  Private/Admin
const approveStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!task.pendingStatus?.requestedStatus) {
      return res.status(400).json({ message: 'No pending status change to approve' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        status: task.pendingStatus.requestedStatus,
        pendingStatus: null,
        updatedAt: new Date(),
        ...(task.pendingStatus.requestedStatus === 'completed' && { completedAt: new Date() }),
      },
      { new: true }
    )
      .populate('assignedTo', 'firstName lastName')
      .populate('createdBy', 'firstName lastName');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  approveStatus,
}; 