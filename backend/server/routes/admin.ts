import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import * as uploadController from '../controllers/uploadController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Apply authentication to all admin routes
router.use(authenticateToken);
router.use(authorizeRoles('Admin'));

// Step 6: Dashboard fetch
router.get('/stats', adminController.getDashboardStats);
router.get('/students', adminController.getStudents);
router.post('/students', adminController.createStudent);
router.delete('/students/:id', adminController.deleteStudent);
router.get('/faculty', adminController.getFaculty);
router.post('/faculty', adminController.createFaculty);
router.delete('/faculty/:id', adminController.deleteFaculty);
router.get('/activities', adminController.getActivities);
router.get('/departments', adminController.getDepartments);
// Course Management
router.get('/courses', adminController.getCourses);
router.post('/courses', adminController.createCourse);
router.delete('/courses/:id', adminController.deleteCourse);
router.put('/courses/:id', adminController.updateCourse);
router.post('/courses/upload-sync', upload.single('document'), uploadController.uploadCourseSync);
router.post('/timetable/upload-sync', upload.single('document'), uploadController.uploadTimetableSync);

// Schedule Management
router.get('/schedules', adminController.getSchedules);
router.post('/schedules', adminController.createSchedule);
router.delete('/schedules/:id', adminController.deleteSchedule);
router.put('/schedules/:id', adminController.updateSchedule);
router.post('/automate-schedules', adminController.automateSchedules);
router.get('/sustainability-analytics', adminController.getSustainabilityAnalytics);
router.get('/settings', adminController.getSystemSettings);

// Department Management
router.post('/departments', adminController.createDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

// Data Synchronization & Uploads
router.post('/upload-sync', upload.single('document'), uploadController.uploadSync);
router.get('/sync-template', uploadController.downloadTemplate);

export default router;
