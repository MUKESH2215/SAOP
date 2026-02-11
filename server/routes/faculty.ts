import { Router, Response } from 'express';
import { query } from '../config/database';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply authentication to all faculty routes
router.use(authenticateToken);
router.use(authorizeRoles('faculty'));

// Get faculty dashboard stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const facultyId = req.user!.id;

    // Get courses taught by faculty
    const courses: any = await query(
      `SELECT COUNT(*) as count FROM courses 
       WHERE faculty_id = ? AND status = 'active'`,
      [facultyId]
    );

    // Get total students across all courses
    const students: any = await query(
      `SELECT COUNT(DISTINCT ce.student_id) as count 
       FROM course_enrollments ce
       JOIN courses c ON ce.course_id = c.id
       WHERE c.faculty_id = ? AND ce.status = 'active'`,
      [facultyId]
    );

    // Get pending submissions
    const pendingSubmissions: any = await query(
      `SELECT COUNT(*) as count FROM assignment_submissions asub
       JOIN assignments a ON asub.assignment_id = a.id
       JOIN courses c ON a.course_id = c.id
       WHERE c.faculty_id = ? AND asub.status = 'submitted'`,
      [facultyId]
    );

    // Get graded count
    const graded: any = await query(
      `SELECT COUNT(*) as count FROM assignment_submissions asub
       JOIN assignments a ON asub.assignment_id = a.id
       JOIN courses c ON a.course_id = c.id
       WHERE c.faculty_id = ? AND asub.status = 'graded'`,
      [facultyId]
    );

    res.json({
      activeCourses: courses[0].count,
      totalStudents: students[0].count,
      pendingSubmissions: pendingSubmissions[0].count,
      graded: graded[0].count
    });
  } catch (error) {
    console.error('Faculty stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all courses taught by faculty
router.get('/courses', async (req: AuthRequest, res: Response) => {
  try {
    const facultyId = req.user!.id;

    const courses: any = await query(
      `SELECT 
        c.*,
        COUNT(DISTINCT ce.student_id) as students,
        COUNT(DISTINCT a.id) as assignments,
        COUNT(DISTINCT asub.id) as submissions
       FROM courses c
       LEFT JOIN course_enrollments ce ON c.id = ce.course_id AND ce.status = 'active'
       LEFT JOIN assignments a ON c.id = a.course_id
       LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
       WHERE c.faculty_id = ?
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [facultyId]
    );

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Create new course
router.post('/courses', async (req: AuthRequest, res: Response) => {
  try {
    const facultyId = req.user!.id;
    const { courseCode, courseName, description, semester, credits, maxStudents } = req.body;

    const result: any = await query(
      `INSERT INTO courses (course_code, course_name, description, faculty_id, semester, credits, max_students) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [courseCode, courseName, description, facultyId, semester, credits || 3, maxStudents || 100]
    );

    res.status(201).json({
      success: true,
      courseId: result.insertId,
      message: 'Course created successfully'
    });
  } catch (error: any) {
    console.error('Create course error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Course code already exists' });
    }
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Get course details with students
router.get('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const facultyId = req.user!.id;

    const courses: any = await query(
      'SELECT * FROM courses WHERE id = ? AND faculty_id = ?',
      [id, facultyId]
    );

    if (courses.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get enrolled students
    const students = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, 
              ce.grade, ce.progress, ce.enrollment_date
       FROM course_enrollments ce
       JOIN users u ON ce.student_id = u.id
       WHERE ce.course_id = ? AND ce.status = 'active'
       ORDER BY u.last_name, u.first_name`,
      [id]
    );

    res.json({
      course: courses[0],
      students
    });
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// Get recent submissions for faculty
router.get('/submissions', async (req: AuthRequest, res: Response) => {
  try {
    const facultyId = req.user!.id;

    const submissions = await query(
      `SELECT 
        asub.*,
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        c.course_code,
        a.title as assignment_title
       FROM assignment_submissions asub
       JOIN users u ON asub.student_id = u.id
       JOIN assignments a ON asub.assignment_id = a.id
       JOIN courses c ON a.course_id = c.id
       WHERE c.faculty_id = ?
       ORDER BY asub.submitted_at DESC
       LIMIT 20`,
      [facultyId]
    );

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Grade a submission
router.put('/submissions/:id/grade', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { grade, feedback } = req.body;

    await query(
      `UPDATE assignment_submissions 
       SET grade = ?, feedback = ?, status = 'graded', graded_at = NOW()
       WHERE id = ?`,
      [grade, feedback, id]
    );

    // Create notification for student
    const submission: any = await query(
      'SELECT student_id FROM assignment_submissions WHERE id = ?',
      [id]
    );

    if (submission.length > 0) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          submission[0].student_id,
          'Assignment Graded',
          `Your submission has been graded. Score: ${grade}`,
          'grade',
          'submission',
          id
        ]
      );
    }

    res.json({ success: true, message: 'Submission graded successfully' });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ error: 'Failed to grade submission' });
  }
});

// Upload course material
router.post('/materials', async (req: AuthRequest, res: Response) => {
  try {
    const facultyId = req.user!.id;
    const { courseId, title, description, fileType, filePath, fileSize } = req.body;

    // Verify course belongs to faculty
    const courses: any = await query(
      'SELECT id FROM courses WHERE id = ? AND faculty_id = ?',
      [courseId, facultyId]
    );

    if (courses.length === 0) {
      return res.status(403).json({ error: 'Unauthorized course access' });
    }

    const result: any = await query(
      `INSERT INTO course_materials (course_id, title, description, file_type, file_path, file_size, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [courseId, title, description, fileType, filePath, fileSize, facultyId]
    );

    res.status(201).json({
      success: true,
      materialId: result.insertId,
      message: 'Material uploaded successfully'
    });
  } catch (error) {
    console.error('Upload material error:', error);
    res.status(500).json({ error: 'Failed to upload material' });
  }
});

// Send announcement to students
router.post('/announcements', async (req: AuthRequest, res: Response) => {
  try {
    const facultyId = req.user!.id;
    const { courseId, message } = req.body;

    // Verify course belongs to faculty
    const courses: any = await query(
      'SELECT id, course_name FROM courses WHERE id = ? AND faculty_id = ?',
      [courseId, facultyId]
    );

    if (courses.length === 0) {
      return res.status(403).json({ error: 'Unauthorized course access' });
    }

    // Get all enrolled students
    const students: any = await query(
      'SELECT student_id FROM course_enrollments WHERE course_id = ? AND status = ?',
      [courseId, 'active']
    );

    // Create notifications for all students
    const notifications = students.map((student: any) => [
      student.student_id,
      `Announcement: ${courses[0].course_name}`,
      message,
      'announcement',
      'course',
      courseId
    ]);

    if (notifications.length > 0) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
         VALUES ?`,
        [notifications]
      );
    }

    res.json({ 
      success: true, 
      message: `Announcement sent to ${notifications.length} students` 
    });
  } catch (error) {
    console.error('Send announcement error:', error);
    res.status(500).json({ error: 'Failed to send announcement' });
  }
});

export default router;