const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadAvatar } = require('../config/cloudinary');
const {
  register, login, getProfile, updateProfile, changePassword,
  getUserById, followUser, getAllUsers, deleteUser
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadAvatar.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/:id', getUserById);
router.post('/follow/:id', protect, followUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
