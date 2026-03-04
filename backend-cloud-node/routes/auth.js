const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new Store and its Admin User
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login and return JWT Token
router.post('/login', authController.login);

module.exports = router;
