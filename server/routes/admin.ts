import { Router, Response } from 'express';
import { query } from '../config/database';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply authentication to all admin routes
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Get dashboard statistics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    // Get total students
    const students: any = await query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'student'"
    );
    
    // Get total faculty
    const faculty: any = await query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'faculty'"
    );
    
    // Get active courses
    const courses: any = await query(
      "SELECT COUNT(*) as count FROM courses WHERE status = 'active'"
    );

    res.json({
      totalStudents: students[0].count,
      totalFaculty: faculty[0].count,
      activeCourses: courses[0].count,
      papersSaved: 45200 // This could be calculated based on submissions
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all students
router.get('/students', async (req: AuthRequest, res: Response) => {
  try {
    const students = await query(
      `SELECT id, email, first_name, last_name, created_at 
       FROM users WHERE role = 'student' 
       ORDER BY created_at DESC`
    );
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get all faculty
router.get('/faculty', async (req: AuthRequest, res: Response) => {
  try {
    const faculty = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.created_at,
              COUNT(c.id) as course_count
       FROM users u
       LEFT JOIN courses c ON u.id = c.faculty_id AND c.status = 'active'
       WHERE u.role = 'faculty'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    res.json(faculty);
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ error: 'Failed to fetch faculty' });
  }
});

// Get recent activities
router.get('/activities', async (req: AuthRequest, res: Response) => {
  try {
    const activities = await query(
      `SELECT 
        'enrollment' as type,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        c.course_name as details,
        ce.enrollment_date as timestamp
       FROM course_enrollments ce
       JOIN users u ON ce.student_id = u.id
       JOIN courses c ON ce.course_id = c.id
       ORDER BY ce.enrollment_date DESC
       LIMIT 10`
    );
    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Create new user (student or faculty)
router.post('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!['student', 'faculty'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(password, 10);

    const result: any = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName, role]
    );

    res.status(201).json({
      success: true,
      userId: result.insertId,
      message: `${role} created successfully`
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Delete user
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await query('DELETE FROM users WHERE id = ? AND role != ?', [id, 'admin']);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;