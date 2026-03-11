import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post('/register', [
  body('name', 'Name is required').notEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  validate
], register);

router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists(),
  validate
], login);

router.get('/me', protect, getMe);

export default router;
