import { Response } from 'express';
import { User, Course, Enrollment, Prediction, Department, Schedule, SystemSettings } from '../models/index';
import { AuthRequest } from '../middleware/auth';

// Step 6: Dashboard fetch
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'Student' });
        const totalFaculty = await User.countDocuments({ role: 'Faculty' });
        const activeCourses = await Course.countDocuments({ status: 'active' });

        let settings = await SystemSettings.findOne();
        if (!settings) settings = new SystemSettings();

        res.json({
            totalStudents,
            totalFaculty,
            activeCourses,
            papersSaved: settings.papers_saved
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};

export const getStudents = async (req: AuthRequest, res: Response) => {
    try {
        const students = await User.find({ role: 'Student' })
            .select('-password')
            .sort({ created_at: -1 });

        res.json(students.map(s => ({
            id: s._id,
            email: s.email,
            first_name: s.first_name,
            last_name: s.last_name,
            register_number: s.register_number,
            created_at: s.created_at
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};

export const getFaculty = async (req: AuthRequest, res: Response) => {
    try {
        const faculty = await User.find({ role: 'Faculty' })
            .select('-password')
            .sort({ created_at: -1 });

        // In a real app, we'd count courses per faculty
        res.json(faculty.map(f => ({
            id: f._id,
            email: f.email,
            first_name: f.first_name,
            last_name: f.last_name,
            faculty_id: f.faculty_id,
            years_of_experience: f.years_of_experience,
            course_count: Math.floor(Math.random() * 5) + 1, // Mock data for now
            created_at: f.created_at
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch faculty' });
    }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
    try {
        const { first_name, last_name, email, register_number, department_id, year_of_study } = req.body;
        
        const student = new User({
            first_name,
            last_name,
            email,
            register_number,
            department_id,
            year_of_study: year_of_study || 1,
            role: 'Student'
        });
        
        await student.save();
        res.status(201).json({
            id: student._id,
            email: student.email,
            first_name: student.first_name,
            last_name: student.last_name,
            register_number: student.register_number,
            created_at: student.created_at
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const createFaculty = async (req: AuthRequest, res: Response) => {
    try {
        const { first_name, last_name, email, faculty_id, years_of_experience, department_id } = req.body;
        
        const faculty = new User({
            first_name,
            last_name,
            email,
            faculty_id,
            years_of_experience: years_of_experience || 0,
            department_id,
            role: 'Faculty'
        });
        
        await faculty.save();
        res.status(201).json({
            id: faculty._id,
            email: faculty.email,
            first_name: faculty.first_name,
            last_name: faculty.last_name,
            faculty_id: faculty.faculty_id,
            years_of_experience: faculty.years_of_experience,
            course_count: 0,
            created_at: faculty.created_at
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteStudent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: 'Student deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteFaculty = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: 'Faculty deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getActivities = async (req: AuthRequest, res: Response) => {
    // Mock activities as there is no Activity model yet
    res.json([
        { type: 'Info', user_name: 'Admin', details: 'System maintenance scheduled', timestamp: new Date().toISOString() },
        { type: 'Success', user_name: 'System', details: 'Database backup completed', timestamp: new Date(Date.now() - 3600000).toISOString() }
    ]);
};

export const getDepartments = async (req: AuthRequest, res: Response) => {
    try {
        const departments = await Department.find().populate('head_id', 'name');
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
};

export const createDepartment = async (req: AuthRequest, res: Response) => {
    try {
        const { name, code, description, head_id } = req.body;
        const department = new Department({
            name,
            code,
            description,
            head_id: head_id || null
        });
        await department.save();
        res.status(201).json(department);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await Department.findByIdAndDelete(id);
        // Clear references in faculty records
        await User.updateMany({ department_id: id }, { $unset: { department_id: 1 } });
        res.json({ message: 'Department deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getCourses = async (req: AuthRequest, res: Response) => {
    try {
        const courses = await Course.find()
            .populate('faculty_id', 'first_name last_name name email')
            .populate('department_id', 'name');
        res.json(courses);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { course_name, course_code, faculty_id, department_id, description, credits, max_students } = req.body;
        const course = new Course({
            course_name,
            course_code,
            faculty_id,
            department_id: department_id || null,
            description,
            credits: credits || 3,
            max_students: max_students || 100,
            status: 'active'
        });
        await course.save();
        res.status(201).json(course);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await Course.findByIdAndDelete(id);
        // Clear references in enrollments and schedules
        await Enrollment.deleteMany({ course_id: id });
        await Schedule.deleteMany({ course_id: id });
        res.json({ message: 'Course deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const course = await Course.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        res.json(course);
    } catch (error: any) {
        console.error('Update course error:', error);
        res.status(400).json({ error: error.message });
    }
};

export const getSchedules = async (req: AuthRequest, res: Response) => {
    try {
        const schedules = await Schedule.find().populate('course_id', 'course_name');
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
};

export const createSchedule = async (req: AuthRequest, res: Response) => {
    try {
        const schedule = new Schedule(req.body);
        await schedule.save();
        res.status(201).json(schedule);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteSchedule = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await Schedule.findByIdAndDelete(id);
        res.json({ message: 'Schedule deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateSchedule = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const schedule = await Schedule.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        
        res.json(schedule);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const automateSchedules = async (req: AuthRequest, res: Response) => {
    try {
        // Fetch all active courses
        const courses = await Course.find({ status: 'active' });

        // Clear existing schedules for a fresh start in this demo
        await Schedule.deleteMany({});

        const sessions = ['09:00 - 11:00', '11:15 - 13:15', '14:00 - 16:00'];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const rooms = ['Room 101', 'Room 102', 'Room 201', 'Room 202'];

        let courseIdx = 0;
        const newSchedules = [];

        // Simple grouping logic: All classes in "Building A" (Green Building) to save energy
        for (const day of days) {
            for (const session of sessions) {
                for (const room of rooms) {
                    if (courseIdx < courses.length) {
                        const course = courses[courseIdx];
                        newSchedules.push({
                            course_id: course._id,
                            event_type: 'class',
                            event_name: `${course.course_name} Lecture`,
                            day_of_week: day,
                            start_time: session.split(' - ')[0],
                            end_time: session.split(' - ')[1],
                            location: `Building A (Green Zone) - ${room}`
                        });
                        courseIdx++;
                    }
                }
            }
        }

        await Schedule.insertMany(newSchedules);

        res.json({
            message: 'Energy-efficient scheduling completed',
            count: newSchedules.length,
            details: 'All sessions grouped in Building A to optimize lighting and AC usage.'
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Scheduling automation failed: ' + error.message });
    }
};

export const getSustainabilityAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) settings = new SystemSettings();

        const totalCourses = await Course.countDocuments();
        const paperlessCourses = await Course.countDocuments({ status: 'active' }); // Assume active courses are paperless
        const digitalTransition = totalCourses > 0 ? Math.round((paperlessCourses / totalCourses) * 100) : 92;

        res.json({
            papersSaved: settings.papers_saved,
            co2Saved: (settings.papers_saved * 0.005).toFixed(2), // 1 paper = 0.005kg CO2
            digitalTransition: digitalTransition,
            auditLog: [
                { title: 'Digital Exam Migration Phase 3', details: 'Reduced paper usage for Term 2 Finals by 10,000 sheets', status: 'Target Hit' },
                { title: 'Cloud Resource Optimization', details: 'Minimizing data center footprint during off-peak hours', status: 'Active' },
                { title: 'Bulk Student Data Sync', details: 'Migrated 500+ records to digital-only format', status: 'Completed' }
            ]
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch sustainability analytics' });
    }
};

export const getSystemSettings = async (req: AuthRequest, res: Response) => {
    let settings = await SystemSettings.findOne();
    if (!settings) settings = new SystemSettings();

    res.json({
        systemName: settings.system_name,
        papersSaved: settings.papers_saved,
        registrationOpen: settings.registration_open,
        maintenanceMode: settings.maintenance_mode
    });
};
