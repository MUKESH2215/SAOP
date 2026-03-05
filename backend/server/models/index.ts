import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'Admin' | 'Faculty' | 'Student';
    profile_image?: string;
    department_id?: mongoose.Types.ObjectId;
    semester?: string; // For students
    register_number?: string; // For students
    year_of_study?: number; // For students
    faculty_id?: string; // For faculty
    years_of_experience?: number; // For faculty
    created_at: Date;
    updated_at: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Faculty', 'Student'], required: true, index: true },
    profile_image: { type: String },
    department_id: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    semester: { type: String },
    register_number: { type: String, sparse: true, unique: true, index: true },
    year_of_study: { type: Number },
    faculty_id: { type: String, sparse: true, unique: true, index: true },
    years_of_experience: { type: Number },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const User: mongoose.Model<IUser> = mongoose.models.User ? mongoose.models.User as mongoose.Model<IUser> : mongoose.model<IUser>('User', UserSchema);

// Department Schema
export interface IDepartment extends Document {
    name: string;
    description?: string;
    code: string;
    head_id?: mongoose.Types.ObjectId;
}

const DepartmentSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    head_id: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Department: mongoose.Model<IDepartment> = mongoose.models.Department ? mongoose.models.Department as mongoose.Model<IDepartment> : mongoose.model<IDepartment>('Department', DepartmentSchema);


// Course Schema
export interface ICourse extends Document {
    course_code: string;
    course_name: string;
    description?: string;
    faculty_id: mongoose.Types.ObjectId;
    semester?: string;
    credits: number;
    max_students: number;
    status: 'active' | 'inactive' | 'archived';
    created_at: Date;
    updated_at: Date;
}

const CourseSchema: Schema = new Schema({
    course_code: { type: String, required: true, unique: true, index: true },
    course_name: { type: String, required: true },
    description: { type: String },
    faculty_id: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    department_id: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    semester: { type: String },
    credits: { type: Number, default: 3 },
    max_students: { type: Number, default: 100 },
    status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active', index: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });


export const Course: mongoose.Model<ICourse> = mongoose.models.Course ? mongoose.models.Course as mongoose.Model<ICourse> : mongoose.model<ICourse>('Course', CourseSchema);

// Enrollment Schema
export interface IEnrollment extends Document {
    student_id: mongoose.Types.ObjectId;
    course_id: mongoose.Types.ObjectId;
    enrollment_date: Date;
    grade?: string;
    attendance_percentage: number;
    internal_marks: number;
    assignment_total: number;
    progress: number;
    status: 'active' | 'dropped' | 'completed';
}

const EnrollmentSchema: Schema = new Schema({
    student_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    enrollment_date: { type: Date, default: Date.now },
    grade: { type: String },
    attendance_percentage: { type: Number, default: 0 },
    internal_marks: { type: Number, default: 0 },
    assignment_total: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'dropped', 'completed'], default: 'active', index: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });


EnrollmentSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

export const Enrollment: mongoose.Model<IEnrollment> = mongoose.models.Enrollment ? mongoose.models.Enrollment as mongoose.Model<IEnrollment> : mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);

// Assignment Schema
const AssignmentSchema: Schema = new Schema({
    course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    due_date: { type: Date, required: true, index: true },
    total_points: { type: Number, default: 100 },
    status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft', index: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Assignment = mongoose.Model<any> = mongoose.models.Assignment ? mongoose.models.Assignment as mongoose.Model<any> : mongoose.model('Assignment', AssignmentSchema);

// Submission Schema
const SubmissionSchema: Schema = new Schema({
    assignment_id: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    student_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    submission_text: { type: String },
    file_path: { type: String },
    submitted_at: { type: Date, default: Date.now },
    grade: { type: Number },
    feedback: { type: String },
    status: { type: String, enum: ['submitted', 'graded', 'late', 'pending'], default: 'pending', index: true },
    graded_at: { type: Date },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

SubmissionSchema.index({ assignment_id: 1, student_id: 1 }, { unique: true });

export const Submission = mongoose.Model<any> = mongoose.models.Submission ? mongoose.models.Submission as mongoose.Model<any> : mongoose.model('Submission', SubmissionSchema);

// Material Schema
const MaterialSchema: Schema = new Schema({
    course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    file_type: { type: String },
    file_path: { type: String, required: true },
    file_size: { type: String },
    authorized_emails: [{ type: String }], // List of emails authorized to view this material
    uploaded_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });


export const Material = mongoose.Model<any> = mongoose.models.Material ? mongoose.models.Material as mongoose.Model<any> : mongoose.model('Material', MaterialSchema);

// Schedule Schema
const ScheduleSchema: Schema = new Schema({
    course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    event_type: { type: String, enum: ['class', 'exam', 'lab', 'tutorial'], required: true },
    event_name: { type: String, required: true },
    day_of_week: { type: String },
    start_time: { type: String },
    end_time: { type: String },
    location: { type: String },
    event_date: { type: Date },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Schedule = mongoose.Model<any> = mongoose.models.Schedule ? mongoose.models.Schedule as mongoose.Model<any> : mongoose.model('Schedule', ScheduleSchema);

// Notification Schema
const NotificationSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'success', 'assignment', 'grade', 'announcement'], default: 'info' },
    is_read: { type: Boolean, default: false, index: true },
    related_entity_type: { type: String },
    related_entity_id: { type: Schema.Types.ObjectId },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Notification = mongoose.Model<any> = mongoose.models.Notification ? mongoose.models.Notification as mongoose.Model<any> : mongoose.model('Notification', NotificationSchema);

// Attendance Schema
export interface IAttendance extends Document {
    student_id: mongoose.Types.ObjectId;
    course_id: mongoose.Types.ObjectId;
    date: Date;
    status: 'present' | 'absent' | 'late';
}

const AttendanceSchema: Schema = new Schema({
    student_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    date: { type: Date, required: true, index: true },
    status: { type: String, enum: ['present', 'absent', 'late'], required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Attendance = mongoose.Model<IAttendance> = mongoose.models.Attendance ? mongoose.models.Attendance as mongoose.Model<IAttendance> : mongoose.model<IAttendance>('Attendance', AttendanceSchema);

// Prediction Schema
export interface IPrediction extends Document {
    student_id: mongoose.Types.ObjectId;
    course_id: mongoose.Types.ObjectId;
    predicted_result: 'Pass' | 'Fail';
    risk_level: 'Low' | 'Medium' | 'High';
    confidence_score: number;
    improvement_suggestions: string[];
    analysis_date: Date;
}

const PredictionSchema: Schema = new Schema({
    student_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course_id: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    predicted_result: { type: String, enum: ['Pass', 'Fail'], required: true },
    risk_level: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    confidence_score: { type: Number },
    improvement_suggestions: [{ type: String }],
    analysis_date: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Prediction = mongoose.Model<IPrediction> = mongoose.models.Prediction ? mongoose.models.Prediction as mongoose.Model<IPrediction> : mongoose.model<IPrediction>('Prediction', PredictionSchema);

// System Settings Schema
export interface ISystemSettings extends Document {
    system_name: string;
    papers_saved: number;
    registration_open: boolean;
    maintenance_mode: boolean;
    updated_at: Date;
}

const SystemSettingsSchema: Schema = new Schema({
    system_name: { type: String, default: 'SAOP Academic Portal' },
    papers_saved: { type: Number, default: 48500 },
    registration_open: { type: Boolean, default: true },
    maintenance_mode: { type: Boolean, default: false },
}, { timestamps: { updatedAt: 'updated_at' } });

export const SystemSettings: mongoose.Model<ISystemSettings> = mongoose.models.SystemSettings ? mongoose.models.SystemSettings as mongoose.Model<ISystemSettings> : mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);

