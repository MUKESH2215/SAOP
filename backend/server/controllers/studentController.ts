import { Response } from 'express';
import bcrypt from 'bcrypt';
import { User, Enrollment, Submission, Assignment, Course, Material, Schedule, Notification } from '../models';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// Step 2: Admin adds student
export const addStudent = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, name, semester, department_id } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newStudent = new User({
            email,
            password: passwordHash,
            name,
            role: 'Student',
            semester,
            department_id: department_id ? new mongoose.Types.ObjectId(department_id) : undefined
        });

        await newStudent.save();

        res.status(201).json({
            success: true,
            message: 'Student added successfully',
            studentId: newStudent._id
        });
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Existing student routes logic
export const getStats = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;
        const activeCourses = await Enrollment.countDocuments({ student_id: studentId, status: 'active' });
        const completedAssignments = await Submission.countDocuments({ student_id: studentId, status: 'graded' });

        const gradedSubmissions = await Submission.find({ student_id: studentId, grade: { $ne: null } });
        const gpa = gradedSubmissions.length > 0
            ? gradedSubmissions.reduce((acc, curr: any) => acc + (curr.grade || 0), 0) / gradedSubmissions.length
            : 0;

        const enrolledCourseIds = await Enrollment.find({ student_id: studentId, status: 'active' }).distinct('course_id');
        const totalAssignments = await Assignment.find({ course_id: { $in: enrolledCourseIds }, status: { $ne: 'closed' } });
        const submittedAssignmentIds = await Submission.find({ student_id: studentId }).distinct('assignment_id');
        const pendingAssignments = totalAssignments.filter(a => !submittedAssignmentIds.includes(a._id)).length;

        res.json({
            activeCourses,
            pendingAssignments,
            completedAssignments,
            gpa: Number(gpa.toFixed(2)),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch statistics" });
    }
};

export const getCourses = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;
        const enrollments = await Enrollment.find({ student_id: studentId, status: 'active' })
            .populate({
                path: 'course_id',
                populate: { path: 'faculty_id', select: 'name' }
            });

        const courses = enrollments.map(e => {
            const c = e.course_id as any;
            return {
                id: c._id,
                course_code: c.course_code,
                course_name: c.course_name,
                instructor: c.faculty_id ? c.faculty_id.name : 'Unknown',
                progress: e.progress,
                grade: e.grade
            };
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch courses" });
    }
};

export const getAvailableCourses = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;
        const enrolledCourseIds = await Enrollment.find({
            student_id: studentId,
            status: { $in: ['active', 'completed'] }
        }).distinct('course_id');

        const courses = await Course.find({
            status: 'active',
            _id: { $nin: enrolledCourseIds }
        });

        const enrichedCourses = await Promise.all(courses.map(async (c) => {
            const activeEnrollments = await Enrollment.countDocuments({ course_id: c._id, status: 'active' });
            return {
                id: c._id,
                course_code: c.course_code,
                course_name: c.course_name,
                semester: c.semester,
                credits: c.credits,
                seatsRemaining: c.max_students - activeEnrollments
            };
        }));

        res.json(enrichedCourses.filter(c => c.seatsRemaining > 0));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch available courses" });
    }
};

export const enrollInCourse = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;
        const courseId = req.params.id;

        const existing = await Enrollment.findOne({ student_id: studentId, course_id: courseId });
        if (existing) {
            return res.status(409).json({ error: "Already enrolled in this course" });
        }

        const newEnrollment = new Enrollment({
            student_id: studentId,
            course_id: courseId,
            status: 'active'
        });

        await newEnrollment.save();
        res.json({ success: true, message: "Enrollment successful" });
    } catch (error) {
        res.status(500).json({ error: "Failed to enroll in course" });
    }
};

export const getAssignments = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;
        const enrolledCourseIds = await Enrollment.find({ student_id: studentId, status: 'active' }).distinct('course_id');
        const assignments = await Assignment.find({ course_id: { $in: enrolledCourseIds } })
            .populate('course_id', 'course_code course_name')
            .sort({ due_date: 1 });

        const enrichedAssignments = await Promise.all(assignments.map(async (a) => {
            const submission = await Submission.findOne({ assignment_id: a._id, student_id: studentId });
            return {
                id: a._id,
                title: a.title,
                due_date: (a as any).due_date,
                course_code: (a.course_id as any).course_code,
                course_name: (a.course_id as any).course_name,
                status: submission ? submission.status : 'pending',
                submitted_at: submission ? (submission as any).submitted_at : null
            };
        }));

        res.json(enrichedAssignments);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch assignments" });
    }
};

export const submitAssignment = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;
        const assignmentId = req.params.id;
        const { submissionText, filePath } = req.body;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        await Submission.findOneAndUpdate(
            { assignment_id: assignmentId, student_id: studentId },
            {
                submission_text: submissionText,
                file_path: filePath,
                status: 'submitted',
                submitted_at: new Date()
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: "Assignment submitted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to submit assignment" });
    }
};

export const getStudentMaterials = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;
        const { courseId } = req.query;
        const enrolledCourseIds = await Enrollment.find({ student_id: studentId, status: 'active' }).distinct('course_id');

        let filter: any = { course_id: { $in: enrolledCourseIds } };
        if (courseId) {
            filter.course_id = courseId;
        }

        const materials = await Material.find(filter)
            .populate('course_id', 'course_code course_name')
            .sort({ uploaded_at: -1 });

        const formattedMaterials = materials.map(m => ({
            id: m._id,
            title: m.title,
            file_type: (m as any).file_type,
            file_size: (m as any).file_size,
            uploaded_at: (m as any).updated_at,
            course_code: (m.course_id as any).course_code,
            course_name: (m.course_id as any).course_name
        }));

        res.json(formattedMaterials);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch materials" });
    }
};

export const getStudentSchedule = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;
        const enrolledCourseIds = await Enrollment.find({ student_id: studentId, status: 'active' }).distinct('course_id');
        const schedule = await Schedule.find({ course_id: { $in: enrolledCourseIds } })
            .populate('course_id', 'course_code')
            .sort({ event_date: 1, day_of_week: 1 });

        const formattedSchedule = schedule.map(s => ({
            id: s._id,
            event_type: (s as any).event_type,
            event_name: s.event_name,
            day_of_week: (s as any).day_of_week,
            start_time: (s as any).start_time,
            end_time: (s as any).end_time,
            location: (s as any).location,
            event_date: (s as any).event_date,
            course_code: (s.course_id as any).course_code
        }));

        res.json(formattedSchedule);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch schedule" });
    }
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;
        const notifications = await Notification.find({ user_id: studentId })
            .sort({ created_at: -1 })
            .limit(25);

        const formattedNotifications = notifications.map(n => ({
            id: n._id,
            title: n.title,
            message: n.message,
            type: (n as any).type,
            is_read: n.is_read,
            created_at: (n as any).created_at
        }));

        res.json(formattedNotifications);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user!.id;
        const notificationId = req.params.id;

        const result = await Notification.findOneAndUpdate(
            { _id: notificationId, user_id: studentId },
            { is_read: true },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to update notification" });
    }
};
