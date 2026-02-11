import { Router, Response } from "express";
import { query } from "../config/database";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth";

const router = Router();

// Apply authentication to all student routes
router.use(authenticateToken);
router.use(authorizeRoles("student"));

// Student dashboard stats
router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    const courseRows: any = await query(
      `SELECT COUNT(*) AS count FROM course_enrollments 
       WHERE student_id = ? AND status = 'active'`,
      [studentId],
    );

    const pendingRows: any = await query(
      `SELECT COUNT(*) AS count
       FROM assignments a
       JOIN course_enrollments ce ON ce.course_id = a.course_id AND ce.student_id = ?
       LEFT JOIN assignment_submissions asub 
         ON asub.assignment_id = a.id AND asub.student_id = ?
       WHERE (asub.status IS NULL OR asub.status IN ('pending', 'late', 'submitted'))
         AND a.status != 'closed'`,
      [studentId, studentId],
    );

    const completedRows: any = await query(
      `SELECT COUNT(*) AS count FROM assignment_submissions 
       WHERE student_id = ? AND status = 'graded'`,
      [studentId],
    );

    const [gpaRow]: any = await query(
      `SELECT AVG(grade) AS gpa FROM assignment_submissions 
       WHERE student_id = ? AND grade IS NOT NULL`,
      [studentId],
    );

    res.json({
      activeCourses: Number(courseRows[0]?.count ?? 0),
      pendingAssignments: Number(pendingRows[0]?.count ?? 0),
      completedAssignments: Number(completedRows[0]?.count ?? 0),
      gpa: Number(gpaRow?.gpa ?? 0),
    });
  } catch (error) {
    console.error("Student stats error:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Enrolled courses
router.get("/courses", async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    const courses = await query(
      `SELECT 
        c.id,
        c.course_code,
        c.course_name,
        CONCAT(f.first_name, ' ', f.last_name) AS instructor,
        ce.progress,
        ce.grade
       FROM course_enrollments ce
       JOIN courses c ON ce.course_id = c.id
       LEFT JOIN users f ON c.faculty_id = f.id
       WHERE ce.student_id = ? AND ce.status = 'active'
       ORDER BY c.course_name`,
      [studentId],
    );

    res.json(courses);
  } catch (error) {
    console.error("Student courses error:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// Available courses to enroll
router.get("/courses/available", async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    const courses = await query(
      `SELECT 
        c.id,
        c.course_code,
        c.course_name,
        c.semester,
        c.credits,
        (c.max_students - COUNT(ceActive.id)) AS seatsRemaining
       FROM courses c
       LEFT JOIN course_enrollments ceActive 
         ON ceActive.course_id = c.id AND ceActive.status = 'active'
       WHERE c.status = 'active'
         AND c.id NOT IN (
           SELECT course_id FROM course_enrollments 
           WHERE student_id = ? AND status IN ('active', 'completed')
         )
       GROUP BY c.id
       HAVING seatsRemaining > 0
       ORDER BY c.course_name`,
      [studentId],
    );

    res.json(courses);
  } catch (error) {
    console.error("Available courses error:", error);
    res.status(500).json({ error: "Failed to fetch available courses" });
  }
});

// Enroll in a course
router.post("/courses/:id/enroll", async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;
    const courseId = Number(req.params.id);

    const existing: any = await query(
      `SELECT id FROM course_enrollments 
       WHERE student_id = ? AND course_id = ?`,
      [studentId, courseId],
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Already enrolled in this course" });
    }

    await query(
      `INSERT INTO course_enrollments (student_id, course_id, status) 
       VALUES (?, ?, 'active')`,
      [studentId, courseId],
    );

    res.json({ success: true, message: "Enrollment successful" });
  } catch (error) {
    console.error("Course enrollment error:", error);
    res.status(500).json({ error: "Failed to enroll in course" });
  }
});

// Assignments
router.get("/assignments", async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    const assignments = await query(
      `SELECT 
        a.id,
        a.title,
        a.due_date,
        c.course_code,
        c.course_name,
        COALESCE(asub.status, 'pending') AS status,
        asub.submitted_at
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       JOIN course_enrollments ce ON ce.course_id = c.id AND ce.student_id = ?
       LEFT JOIN assignment_submissions asub 
         ON asub.assignment_id = a.id AND asub.student_id = ?
       WHERE ce.status = 'active'
       ORDER BY a.due_date ASC`,
      [studentId, studentId],
    );

    res.json(assignments);
  } catch (error) {
    console.error("Student assignments error:", error);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

// Submit assignment
router.post(
  "/assignments/:id/submit",
  async (req: AuthRequest, res: Response) => {
    try {
      const studentId = req.user!.id;
      const assignmentId = Number(req.params.id);
      const { submissionText, filePath } = req.body;

      const assignment: any = await query(
        `SELECT a.id FROM assignments a
         JOIN course_enrollments ce ON ce.course_id = a.course_id
         WHERE a.id = ? AND ce.student_id = ?`,
        [assignmentId, studentId],
      );

      if (!assignment.length) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      await query(
        `INSERT INTO assignment_submissions 
          (assignment_id, student_id, submission_text, file_path, status, submitted_at)
         VALUES (?, ?, ?, ?, 'submitted', NOW())
         ON DUPLICATE KEY UPDATE 
           submission_text = VALUES(submission_text),
           file_path = VALUES(file_path),
           status = 'submitted',
           submitted_at = NOW()`,
        [assignmentId, studentId, submissionText || null, filePath || null],
      );

      res.json({ success: true, message: "Assignment submitted successfully" });
    } catch (error) {
      console.error("Submit assignment error:", error);
      res.status(500).json({ error: "Failed to submit assignment" });
    }
  },
);

// Course materials
router.get("/materials", async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { courseId } = req.query;
    const params: any[] = [studentId];

    let filter = "";
    if (courseId) {
      filter = "AND cm.course_id = ?";
      params.push(Number(courseId));
    }

    const materials = await query(
      `SELECT 
        cm.id,
        cm.title,
        cm.file_type,
        cm.file_size,
        cm.uploaded_at,
        c.course_code,
        c.course_name
       FROM course_materials cm
       JOIN courses c ON cm.course_id = c.id
       JOIN course_enrollments ce ON ce.course_id = cm.course_id AND ce.student_id = ?
       WHERE ce.status = 'active' ${filter}
       ORDER BY cm.uploaded_at DESC`,
      params,
    );

    res.json(materials);
  } catch (error) {
    console.error("Student materials error:", error);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
});

// Schedule
router.get("/schedule", async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    const schedule = await query(
      `SELECT 
        s.id,
        s.event_type,
        s.event_name,
        s.day_of_week,
        s.start_time,
        s.end_time,
        s.location,
        s.event_date,
        c.course_code
       FROM schedules s
       JOIN courses c ON s.course_id = c.id
       JOIN course_enrollments ce ON ce.course_id = c.id AND ce.student_id = ?
       WHERE ce.status = 'active'
       ORDER BY 
         COALESCE(s.event_date, DATE_ADD(CURDATE(), INTERVAL 1 YEAR)),
         s.day_of_week`,
      [studentId],
    );

    res.json(schedule);
  } catch (error) {
    console.error("Student schedule error:", error);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});

// Notifications
router.get("/notifications", async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    const notifications = await query(
      `SELECT id, title, message, type, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 25`,
      [studentId],
    );

    res.json(notifications);
  } catch (error) {
    console.error("Student notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.put(
  "/notifications/:id/read",
  async (req: AuthRequest, res: Response) => {
    try {
      const studentId = req.user!.id;
      const notificationId = Number(req.params.id);

      const result: any = await query(
        `UPDATE notifications 
         SET is_read = TRUE 
         WHERE id = ? AND user_id = ?`,
        [notificationId, studentId],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Mark notification error:", error);
      res.status(500).json({ error: "Failed to update notification" });
    }
  },
);

export default router;