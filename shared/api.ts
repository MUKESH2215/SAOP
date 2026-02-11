export type UserRole = 'admin' | 'faculty' | 'student';

export interface DemoResponse {
  message: string;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImage?: string | null;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthenticatedUser;
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  code?: string;
}

export interface AdminStatsResponse {
  totalStudents: number;
  totalFaculty: number;
  activeCourses: number;
  papersSaved: number;
}

export interface AdminActivity {
  type: string;
  user_name?: string;
  details?: string;
  timestamp: string;
}

export interface FacultyStatsResponse {
  activeCourses: number;
  totalStudents: number;
  pendingSubmissions: number;
  graded: number;
}

export interface FacultyCourse {
  id: number;
  course_code: string;
  course_name: string;
  description?: string;
  students: number;
  assignments: number;
  submissions: number;
}

export interface FacultySubmission {
  id: number;
  student_name: string;
  course_code: string;
  assignment_title: string;
  submitted_at: string;
  status: string;
  grade?: number | null;
}

export interface StudentStatsResponse {
  activeCourses: number;
  pendingAssignments: number;
  completedAssignments: number;
  gpa: number;
}

export interface StudentCourse {
  id: number;
  course_code: string;
  course_name: string;
  instructor?: string;
  progress: number;
  grade?: string | null;
}

export interface StudentAssignment {
  id: number;
  course_code: string;
  course_name: string;
  title: string;
  due_date: string;
  status: string;
  submitted_at?: string | null;
}

export interface StudentMaterial {
  id: number;
  course_code: string;
  course_name: string;
  title: string;
  file_type: string;
  file_size?: string | null;
  uploaded_at: string;
}

export interface StudentScheduleItem {
  id: number;
  course_code: string;
  event_type: string;
  event_name: string;
  day_of_week?: string | null;
  event_date?: string | null;
  start_time?: string | null;
  location?: string | null;
}

export interface StudentNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: number | boolean;
  created_at: string;
}
