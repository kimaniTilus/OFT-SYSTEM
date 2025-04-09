const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  approveStatus,
} = require('../controllers/taskController');
const { protect, admin } = require('../middleware/auth');

router.use(protect); // All task routes require authentication

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.route('/:id/approve-status')
  .put(admin, approveStatus);

module.exports = router; 