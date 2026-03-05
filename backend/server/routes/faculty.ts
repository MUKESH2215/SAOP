import { Router, Response } from 'express';
import { User, Course, Enrollment, Assignment, Submission, Material, Notification, Attendance } from '../models';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

import mongoose from 'mongoose';

const router = Router();

// Apply authentication to all faculty routes
router.use(authenticateToken);
router.use(authorizeRoles('Faculty'));

// Get faculty dashboard stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const facultyId = req.user!.id;

    // Get courses taught by faculty
    const activeCourses = await Course.countDocuments({
      faculty_id: facultyId,
      status: 'active'
    });

    // Get total students across all courses
    const facultyCourses = await Course.find({ faculty_id: facultyId });
    const courseIds = facultyCourses.map(c => c._id);

    const totalStudents = await Enrollment.distinct('student_id', {
      course_id: { $in: courseIds },
      status: 'active'
    }).then(docs => docs.length);

    // Get pending submissions
    const pendingSubmissions = await Submission.countDocuments({
      assignment_id: { $in: await Assignment.find({ course_id: { $in: courseIds } }).distinct('_id') },
      status: 'submitted'
    });

    // Get graded count
    const graded = await Submission.countDocuments({
      assignment_id: { $in: await Assignment.find({ course_id: { $in: courseIds } }).distinct('_id') },
      status: 'graded'
    });

    res.json({
      activeCourses,
      totalStudents,
      pendingSubmissions,
      graded
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

    const courses = await Course.find({ faculty_id: facultyId }).sort({ created_at: -1 });

    // Enrich with stats
    const enrichedCourses = await Promise.all(courses.map(async (c) => {
      const studentCount = await Enrollment.countDocuments({ course_id: c._id, status: 'active' });
      const assignmentCount = await Assignment.countDocuments({ course_id: c._id });

      const assignments = await Assignment.find({ course_id: c._id }).distinct('_id');
      const submissionCount = await Submission.countDocuments({ assignment_id: { $in: assignments } });

      return {
        ...c.toObject(),
        id: c._id,
        students: studentCount,
        assignments: assignmentCount,
        submissions: submissionCount
      };
    }));

    res.json(enrichedCourses);
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

    const newCourse = new Course({
      course_code: courseCode,
      course_name: courseName,
      description,
      faculty_id: facultyId,
      semester,
      credits: credits || 3,
      max_students: maxStudents || 100
    });

    await newCourse.save();

    res.status(201).json({
      success: true,
      courseId: newCourse._id,
      message: 'Course created successfully'
    });
  } catch (error: any) {
    console.error('Create course error:', error);
    if (error.code === 11000) {
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

    const course = await Course.findOne({ _id: id, faculty_id: facultyId });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get enrolled students
    const enrollments = await Enrollment.find({ course_id: id })
      .populate('student_id', 'name email');

    const students = enrollments.map(e => {
      const s = e.student_id as any;
      return {
        id: s._id,
        name: s.name,
        email: s.email,
        enrollment_date: e.enrollment_date,
        status: e.status
      };
    });

    res.json({
      course: { ...course.toObject(), id: course._id },
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
    const facultyCourses = await Course.find({ faculty_id: facultyId }).distinct('_id');
    const assignments = await Assignment.find({ course_id: { $in: facultyCourses } });
    const assignmentIds = assignments.map(a => a._id);

    const submissions = await Submission.find({ assignment_id: { $in: assignmentIds } })
      .populate('student_id', 'name')
      .populate({
        path: 'assignment_id',
        select: 'title course_id',
        populate: { path: 'course_id', select: 'course_code' }
      })
      .sort({ submitted_at: -1 })
      .limit(20);

    const formattedSubmissions = submissions.map(s => ({
      ...s.toObject(),
      id: s._id,
      student_name: (s.student_id as any).name,
      course_code: (s.assignment_id as any).course_id.course_code,
      assignment_title: (s.assignment_id as any).title
    }));

    res.json(formattedSubmissions);
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

    const submission = await Submission.findByIdAndUpdate(
      id,
      { grade, feedback, status: 'graded', graded_at: new Date() },
      { new: true }
    );

    if (submission) {
      const notification = new Notification({
        user_id: submission.student_id,
        title: 'Assignment Graded',
        message: `Your submission has been graded. Score: ${grade}`,
        type: 'grade',
        related_entity_type: 'submission',
        related_entity_id: id
      });
      await notification.save();
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
    const course = await Course.findOne({ _id: courseId, faculty_id: facultyId });

    if (!course) {
      return res.status(403).json({ error: 'Unauthorized course access' });
    }

    const newMaterial = new Material({
      course_id: courseId,
      title,
      description,
      file_type: fileType,
      file_path: filePath,
      file_size: fileSize,
      uploaded_by: facultyId
    });

    await newMaterial.save();

    res.status(201).json({
      success: true,
      materialId: newMaterial._id,
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
    const course = await Course.findOne({ _id: courseId, faculty_id: facultyId });

    if (!course) {
      return res.status(403).json({ error: 'Unauthorized course access' });
    }

    // Get all enrolled students
    const enrollments = await Enrollment.find({ course_id: courseId, status: 'active' });
    const studentIds = enrollments.map(e => e.student_id);

    // Create notifications for all students
    const notifications = studentIds.map(studentId => ({
      user_id: studentId,
      title: `Announcement: ${course.course_name}`,
      message,
      type: 'announcement',
      related_entity_type: 'course',
      related_entity_id: courseId
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
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

// --- Attendance & Marks ---

// Mark attendance for a student
router.post('/attendance', async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, courseId, date, status } = req.body;

    // Verify faculty teaches the course
    const course = await Course.findOne({ _id: courseId, faculty_id: req.user!.id });
    if (!course) return res.status(403).json({ error: 'Unauthorized' });

    const attendance = await Attendance.findOneAndUpdate(
      { student_id: studentId, course_id: courseId, date: new Date(date) },
      { status },
      { upsert: true, new: true }
    );

    // Update overall attendance percentage in Enrollment
    const totalClasses = await Attendance.countDocuments({ student_id: studentId, course_id: courseId });
    const presentClasses = await Attendance.countDocuments({ student_id: studentId, course_id: courseId, status: 'present' });
    const percentage = (presentClasses / totalClasses) * 100;

    await Enrollment.findOneAndUpdate(
      { student_id: studentId, course_id: courseId },
      { attendance_percentage: percentage }
    );

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// Update student marks (internal marks, assignment scores)
router.put('/enrollments/:id/marks', async (req: AuthRequest, res: Response) => {
  try {
    const { internal_marks, assignment_total, grade, progress } = req.body;
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { internal_marks, assignment_total, grade, progress },
      { new: true }
    );
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update marks' });
  }
});

export default router;
