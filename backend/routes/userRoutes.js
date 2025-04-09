const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUser,
  deactivateUser,
  getAllUsers,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, getUserProfile);
router.put('/:id', protect, updateUser);
router.put('/:id/deactivate', protect, deactivateUser);

module.exports = router; 