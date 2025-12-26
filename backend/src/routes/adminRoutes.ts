import express from 'express';
import { getAllUsers, updateUserRole, getAuditLogs, createUser, updateUser, deleteUser, overrideLoanStatus } from '../controllers/adminController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/users', protect, authorize('ADMIN'), createUser);
router.put('/users/:id', protect, authorize('ADMIN'), updateUser);
router.delete('/users/:id', protect, authorize('ADMIN'), deleteUser);
router.put('/users/:id/role', protect, authorize('ADMIN'), updateUserRole); // specialized update
router.post('/override-loan/:loanId', protect, authorize('ADMIN'), overrideLoanStatus);
router.get('/audit-logs', protect, authorize('ADMIN'), getAuditLogs);
router.get('/users', protect, authorize('ADMIN'), getAllUsers);

export default router;
