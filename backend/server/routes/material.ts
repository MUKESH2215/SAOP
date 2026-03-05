import { Router } from 'express';
import * as materialController from '../controllers/materialController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Apply authentication
router.use(authenticateToken);

// Step 3: Faculty uploads material
router.post('/upload', authorizeRoles('Faculty'), upload.single('file'), materialController.uploadMaterial);

// Get materials
router.get('/', materialController.getMaterials);

export default router;
