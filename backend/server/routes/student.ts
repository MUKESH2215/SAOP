import { Router } from "express";
import * as studentController from "../controllers/studentController";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth";

const router = Router();

// Step 2: Admin adds student (accessible by Admins)
router.post("/admin-add", authenticateToken, authorizeRoles("Admin"), studentController.addStudent);

// Student routes (accessible by Students)
router.use(authenticateToken);
router.use(authorizeRoles("Student"));

router.get("/stats", studentController.getStats);
router.get("/courses", studentController.getCourses);
// ... other routes can be added as needed



router.get("/courses/available", studentController.getAvailableCourses);
router.post("/courses/:id/enroll", studentController.enrollInCourse);
router.get("/assignments", studentController.getAssignments);
router.post("/assignments/:id/submit", studentController.submitAssignment);
router.get("/materials", studentController.getStudentMaterials);
router.get("/schedule", studentController.getStudentSchedule);
router.get("/notifications", studentController.getNotifications);
router.put("/notifications/:id/read", studentController.markNotificationRead);

export default router;