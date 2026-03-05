import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Plus,
  Settings,
  FileText,
  Zap,
  GraduationCap,
  Leaf,
  Building2,
  TrendingDown,
  TrendingUp,
  Upload,
  Download,
  Trash2,
  User,
  Shield,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminAPI } from "@/lib/api";
import { extractApiError, useApiQuery } from "@/hooks/use-api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [hasError, setHasError] = useState(false);
  const queryClient = useQueryClient();
  
  // Department state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", code: "", description: "" });
  
  // Course state
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddSingleCourseForm, setShowAddSingleCourseForm] = useState(false);
  const [showUploadCoursesForm, setShowUploadCoursesForm] = useState(false);
  const [courseAddOption, setCourseAddOption] = useState("single");
  const [newCourse, setNewCourse] = useState({ name: "", code: "", credits: "", department: "", description: "" });
  const [newCourseData, setNewCourseData] = useState({ name: "", code: "", credits: "", department: "", description: "" });
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showAssignFacultyModal, setShowAssignFacultyModal] = useState(false);
  const [assigningCourse, setAssigningCourse] = useState(null);
  const [selectedFacultyForAssignment, setSelectedFacultyForAssignment] = useState("");
  
  // Schedule state
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [showTimetableUploadModal, setShowTimetableUploadModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ course: "", faculty: "", time: "", room: "", day: "" });
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [timetableUploadData, setTimetableUploadData] = useState(null);
  const [isAutomating, setIsAutomating] = useState(false);
  
  // User state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserType, setNewUserType] = useState("student");
  const [newUserData, setNewUserData] = useState({ name: "", email: "", password: "" });

  const statsQuery = useApiQuery({
    key: ["admin", "stats"],
    fn: async () => {
      try {
        const { data } = await adminAPI.getStats();
        return data;
      } catch (error) {
        console.error('Stats API error:', error);
        throw error;
      }
    },
  });

  const studentsQuery = useApiQuery({
    key: ["admin", "students"],
    fn: async () => {
      try {
        const { data } = await adminAPI.getStudents();
        return data;
      } catch (error) {
        console.error('Students API error:', error);
        throw error;
      }
    },
  });

  const quickActions = [
    { icon: Users, label: "Manage Students", tab: "management" },
    { icon: GraduationCap, label: "Manage Faculty", tab: "management" },
    { icon: Calendar, label: "Create Schedule", tab: "scheduling" },
    { icon: FileText, label: "Generate Reports", tab: "reports" },
    { icon: Settings, label: "System Settings", tab: "settings" },
    { icon: Leaf, label: "Sustainability", tab: "sustainability" },
  ];

  const statsCards = useMemo(() => {
    const stats = statsQuery.data;
    return [
      {
        icon: Users,
        label: "Total Students",
        value: stats?.totalStudents?.toLocaleString() || "0",
        color: "bg-blue-500/10 text-blue-500",
        trend: "+12%"
      },
      {
        icon: BookOpen,
        label: "Total Faculty",
        value: stats?.totalFaculty?.toLocaleString() || "0",
        color: "bg-green-500/10 text-green-500",
        trend: "+8%"
      },
      {
        icon: Calendar,
        label: "Active Courses",
        value: stats?.activeCourses?.toLocaleString() || "0",
        color: "bg-purple-500/10 text-purple-500",
        trend: "+5%"
      },
      {
        icon: Shield,
        label: "Papers Saved This Semester",
        value: (stats?.papersSaved || 0).toLocaleString(),
        color: "bg-emerald-500/10 text-emerald-500",
        trend: "95%"
      },
    ];
  }, [statsQuery.data]);

  const departmentsQuery = useApiQuery({
    key: ["admin", "departments"],
    fn: async () => {
      const { data } = await adminAPI.getDepartments();
      return data;
    },
  });

  const analyticsQuery = useApiQuery({
    key: ["admin", "analytics"],
    fn: async () => {
      const { data } = await adminAPI.getAnalytics();
      return data;
    },
  });

  const sustainabilityQuery = useApiQuery({
    key: ["admin", "sustainability"],
    fn: async () => {
      const { data } = await adminAPI.getSustainabilityAnalytics();
      return data;
    },
  });

  const coursesQuery = useApiQuery({
    key: ["admin", "courses"],
    fn: async () => {
      const { data } = await adminAPI.getCourses();
      return data;
    },
  });

  const schedulesQuery = useApiQuery({
    key: ["admin", "schedules"],
    fn: async () => {
      const { data } = await adminAPI.getSchedules();
      return data;
    },
  });

  const settingsQuery = useApiQuery({
    key: ["admin", "settings"],
    fn: async () => {
      const { data } = await adminAPI.getSystemSettings();
      return data;
    },
  });

  const facultyQuery = useApiQuery({
    key: ["admin", "faculty"],
    fn: async () => {
      const { data } = await adminAPI.getFaculty();
      return data;
    },
  });

  // Handler functions
  const handleCreateDepartment = async () => {
    try {
      await adminAPI.createDepartment(newDept);
      setIsDeptModalOpen(false);
      setNewDept({ name: "", code: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
      toast.success("Department created successfully");
    } catch (error) {
      toast.error("Failed to create department");
    }
  };

  const handleDeleteDepartment = async (id) => {
    try {
      await adminAPI.deleteDepartment(id);
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
      toast.success("Department deleted successfully");
    } catch (error) {
      toast.error("Failed to delete department");
    }
  };

  const handleCreateCourse = async () => {
    try {
      await adminAPI.createCourse(newCourse);
      setShowAddCourseModal(false);
      setNewCourse({ name: "", code: "", credits: "", department: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast.success("Course created successfully");
    } catch (error) {
      toast.error("Failed to create course");
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowEditCourseModal(true);
  };

  const handleUpdateCourse = async () => {
    try {
      await adminAPI.updateCourse(editingCourse.id, editingCourse);
      setShowEditCourseModal(false);
      setEditingCourse(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast.success("Course updated successfully");
    } catch (error) {
      toast.error("Failed to update course");
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      await adminAPI.deleteCourse(id);
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast.success("Course deleted successfully");
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const handleAssignFaculty = (course) => {
    setAssigningCourse(course);
    setShowAssignFacultyModal(true);
  };

  const handleSaveFacultyAssignment = async () => {
    try {
      await adminAPI.updateCourse(assigningCourse.id, { faculty_id: selectedFacultyForAssignment });
      setShowAssignFacultyModal(false);
      setAssigningCourse(null);
      setSelectedFacultyForAssignment("");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast.success("Faculty assigned successfully");
    } catch (error) {
      toast.error("Failed to assign faculty");
    }
  };

  const handleAddSchedule = async () => {
    try {
      await adminAPI.createSchedule(newSchedule);
      setShowAddScheduleModal(false);
      setNewSchedule({ course: "", faculty: "", time: "", room: "", day: "" });
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] });
      toast.success("Schedule created successfully");
    } catch (error) {
      toast.error("Failed to create schedule");
    }
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setShowEditScheduleModal(true);
  };

  const handleUpdateSchedule = async () => {
    try {
      await adminAPI.updateSchedule(selectedSchedule.id, selectedSchedule);
      setShowEditScheduleModal(false);
      setSelectedSchedule(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] });
      toast.success("Schedule updated successfully");
    } catch (error) {
      toast.error("Failed to update schedule");
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await adminAPI.deleteSchedule(id);
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] });
      toast.success("Schedule deleted successfully");
    } catch (error) {
      toast.error("Failed to delete schedule");
    }
  };

  const handleAutomateSchedules = async () => {
    setIsAutomating(true);
    try {
      await adminAPI.automateSchedules();
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] });
      toast.success("Schedules automated successfully");
    } catch (error) {
      toast.error("Failed to automate schedules");
    } finally {
      setIsAutomating(false);
    }
  };

  const handleAddUser = async () => {
    try {
      await adminAPI.createUser(newUserData);
      setShowAddUserModal(false);
      setNewUserData({ name: "", email: "", password: "" });
      setNewUserType("student");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User added successfully");
    } catch (error) {
      toast.error("Failed to add user");
    }
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">There was an error loading the dashboard.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Welcome to admin dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Overview" },
              { id: "management", label: "User Management" },
              { id: "courses", label: "Courses" },
              { id: "scheduling", label: "Scheduling" },
              { id: "reports", label: "Reports" },
              { id: "settings", label: "Settings" },
              { id: "sustainability", label: "Sustainability" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-green-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow border border-green-100">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${index % 2 === 0 ? 'bg-green-100' : 'bg-teal-100'}`}>
                      <stat.icon className={`h-6 w-6 ${index % 2 === 0 ? 'text-green-600' : 'text-teal-600'}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow border border-green-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab(action.tab)}
                    className="flex items-center p-4 border border-green-200 rounded-lg hover:bg-green-50"
                  >
                    <action.icon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow border border-green-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <p className="text-sm text-gray-600">New student registration</p>
                  <span className="ml-auto text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <p className="text-sm text-gray-600">Course schedule updated</p>
                  <span className="ml-auto text-xs text-gray-500">5 hours ago</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <p className="text-sm text-gray-600">System maintenance completed</p>
                  <span className="ml-auto text-xs text-gray-500">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === "management" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border border-green-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-teal-700"
                >
                  Add User
                </button>
              </div>
              
              {/* Students Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentsQuery.data?.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-green-600 hover:text-green-900 mr-3">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would go here - for now showing placeholder */}
        {activeTab !== "overview" && activeTab !== "management" && (
          <div className="bg-white p-6 rounded-lg shadow border border-green-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
            </h2>
            <p className="text-gray-600">
              This section is under development. Please check back later.
            </p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md border border-green-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New User</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User Type</label>
                <select
                  value={newUserType}
                  onChange={(e) => setNewUserType(e.target.value)}
                  className="mt-1 block w-full border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="mt-1 block w-full border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="mt-1 block w-full border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="mt-1 block w-full border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 border border-green-200 rounded-lg text-gray-700 hover:bg-green-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
