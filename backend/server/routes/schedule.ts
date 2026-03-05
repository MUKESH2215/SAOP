import { Router } from 'express';
import * as scheduleController from '../controllers/scheduleController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// Apply authentication
router.use(authenticateToken);

// Step 4: Admin creates schedule
router.post('/', authorizeRoles('Admin'), scheduleController.createSchedule);

// Get schedules
router.get('/', scheduleController.getSchedules);

export default router;
