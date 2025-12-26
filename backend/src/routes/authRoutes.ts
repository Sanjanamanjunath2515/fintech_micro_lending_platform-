import express from 'express';
import { register, login, getMe, getMyCreditScore } from '../controllers/authController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/my-credit-score', protect, authorize('APPLICANT'), getMyCreditScore);

export default router;
