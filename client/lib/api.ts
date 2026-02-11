import axios from "axios";
import type {
  AdminActivity,
  AdminStatsResponse,
  AuthenticatedUser,
  AuthResponse,
  FacultyCourse,
  FacultyStatsResponse,
  FacultySubmission,
  StudentAssignment,
  StudentCourse,
  StudentMaterial,
  StudentNotification,
  StudentScheduleItem,
  StudentStatsResponse,
} from "@shared/api";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:3000/api";

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "user";
export const AUTH_CHANGE_EVENT = "saop:auth-change";

const emitAuthChange = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

const bootstrapAuthToken = () => {
  if (typeof window === "undefined") return;
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

bootstrapAuthToken();

export const setAuthToken = (token: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
  emitAuthChange();
};

export const clearAuthToken = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  persistAuthUser(null);
  delete api.defaults.headers.common.Authorization;
  emitAuthChange();
};

export const persistAuthUser = (user: AuthenticatedUser | null) => {
  if (typeof window === "undefined") return;
  if (user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(AUTH_USER_KEY);
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (email: string, password: string, role: string) =>
    api.post<AuthResponse>("/auth/login", { email, password, role }),
  verify: () => api.get<AuthResponse>("/auth/verify"),
  register: (data: Record<string, unknown>) =>
    api.post("/auth/register", data),
};

export const adminAPI = {
  getStats: () => api.get<AdminStatsResponse>("/admin/stats"),
  getStudents: () =>
    api.get<
      Array<{
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        created_at: string;
      }>
    >("/admin/students"),
  getFaculty: () =>
    api.get<
      Array<{
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        course_count: number;
        created_at: string;
      }>
    >("/admin/faculty"),
  getActivities: () => api.get<AdminActivity[]>("/admin/activities"),
  createUser: (data: Record<string, unknown>) =>
    api.post("/admin/users", data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
};

export const facultyAPI = {
  getStats: () => api.get<FacultyStatsResponse>("/faculty/stats"),
  getCourses: () => api.get<FacultyCourse[]>("/faculty/courses"),
  createCourse: (data: Record<string, unknown>) =>
    api.post("/faculty/courses", data),
  getCourseDetails: (id: number) =>
    api.get(`/faculty/courses/${id}`),
  getSubmissions: () =>
    api.get<FacultySubmission[]>("/faculty/submissions"),
  gradeSubmission: (id: number, grade: number, feedback: string) =>
    api.put(`/faculty/submissions/${id}/grade`, { grade, feedback }),
  uploadMaterial: (data: Record<string, unknown>) =>
    api.post("/faculty/materials", data),
  sendAnnouncement: (courseId: number, message: string) =>
    api.post("/faculty/announcements", { courseId, message }),
};

export const studentAPI = {
  getStats: () => api.get<StudentStatsResponse>("/student/stats"),
  getCourses: () => api.get<StudentCourse[]>("/student/courses"),
  getAvailableCourses: () =>
    api.get<
      Array<{
        id: number;
        course_code: string;
        course_name: string;
        semester?: string;
        credits?: number;
        seatsRemaining: number;
      }>
    >("/student/courses/available"),
  enrollInCourse: (id: number) => api.post(`/student/courses/${id}/enroll`),
  getAssignments: () => api.get<StudentAssignment[]>("/student/assignments"),
  submitAssignment: (id: number, data: Record<string, unknown>) =>
    api.post(`/student/assignments/${id}/submit`, data),
  getMaterials: (courseId?: number) =>
    api.get<StudentMaterial[]>("/student/materials", {
      params: { courseId },
    }),
  getSchedule: () =>
    api.get<StudentScheduleItem[]>("/student/schedule"),
  getNotifications: () =>
    api.get<StudentNotification[]>("/student/notifications"),
  markNotificationRead: (id: number) =>
    api.put(`/student/notifications/${id}/read`),
};

export const storageKeys = {
  token: AUTH_TOKEN_KEY,
  user: AUTH_USER_KEY,
} as const;
