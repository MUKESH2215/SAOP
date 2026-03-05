import { Router } from 'express';
import * as predictionController from '../controllers/predictionController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// Apply authentication
router.use(authenticateToken);

// Step 5: Prediction results (stored by system/admin)
router.post('/store', authorizeRoles('Admin'), predictionController.storePrediction);

// Get predictions
router.get('/', predictionController.getPredictions);

export default router;
