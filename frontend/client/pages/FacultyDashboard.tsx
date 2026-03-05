import { useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  Users,
  Clock,
  MessageSquare,
  Upload,
  CheckCircle,
  Plus,
  UserCheck,
  Award,
  BarChart,
  CalendarCheck,
  Leaf,
  Target,
  TrendingUp,
  Bell,
  Send,
  User,
  Video,
  Shield,
  Eye,
  Download,
  MessageCircle,
  PenTool,
  FolderOpen,
  Copy,
  ExternalLink,
  Search,
  Filter,
  Edit,
  Trash2,
} from "lucide-react";

import { extractApiError, useApiQuery, useApiMutation } from "@/hooks/use-api";
import { facultyAPI, predictionAPI } from "@/lib/api";
import { toast } from "sonner";

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState("courses");
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showSyllabusUpload, setShowSyllabusUpload] = useState(false);
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState<any>(null);
  const [courseModules, setCourseModules] = useState<{[key: string]: any[]}>({});
  const [isDragging, setIsDragging] = useState(false);
  const [courseForm, setCourseForm] = useState({
    courseCode: "",
    courseName: "",
    description: "",
    semester: "",
    credits: 3,
    maxStudents: 100
  });

  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [showMarksDialog, setShowMarksDialog] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", courseId: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [attendanceForm, setAttendanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'present'
  });
  const [marksForm, setMarksForm] = useState({
    internal_marks: 0,
    assignment_total: 0,
    grade: '',
    progress: 0
  });

  const statsQuery = useApiQuery({
    key: ["faculty", "stats"],
    fn: async () => {
      const { data } = await facultyAPI.getStats();
      return data;
    },
  });

  const coursesQuery = useApiQuery({
    key: ["faculty", "courses"],
    fn: async () => {
      const { data } = await facultyAPI.getCourses();
      return data;
    },
  });

  const submissionsQuery = useApiQuery({
    key: ["faculty", "submissions"],
    fn: async () => {
      const { data } = await facultyAPI.getSubmissions();
      return data;
    },
  });

  const attendanceQuery = useApiQuery({
    key: ["faculty", "attendance"],
    fn: async () => {
      // Mock data for now
      return [];
    },
  });

  const materialsQuery = useApiQuery({
    key: ["faculty", "materials"],
    fn: async () => {
      // Mock data for now
      return [];
    },
  });

  const sustainabilityQuery = useApiQuery({
    key: ["faculty", "sustainability"],
    fn: async () => {
      // Mock data for now
      return { papersSaved: 2840, carbonReduction: 14.2 };
    },
  });

  const facultyData = {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@university.edu", 
    department: "Computer Science",
    totalStudents: statsQuery.data?.totalStudents || 156,
    papersSaved: 2840,
    carbonReduction: 14.2,
    ...statsQuery.data
  };

  const handleUploadMaterial = async (file: File, courseId: string, materialType: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", courseId);
    formData.append("materialType", materialType);

    try {
      // Mock upload for now
      toast.success(`Material uploaded successfully! You saved approximately ${Math.ceil(file.size / 1024 / 1024)} MB of paper.`);
      setShowUploadModal(false);
    } catch (err) {
      toast.error(`Upload failed: ${extractApiError(err)}`);
    }
  };

  const handleGradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
    try {
      // Mock grading for now
      toast.success("Submission graded successfully");
      setShowGradingModal(false);
      setSelectedSubmission(null);
    } catch (err) {
      toast.error(`Grading failed: ${extractApiError(err)}`);
    }
  };

  const handlePostAnnouncement = async () => {
    try {
      // Mock announcement for now
      toast.success("Announcement posted successfully");
      setShowAnnouncementModal(false);
      setNewAnnouncement({ title: "", content: "", courseId: "" });
    } catch (err) {
      toast.error(`Post failed: ${extractApiError(err)}`);
    }
  };

  const filteredSubmissions = submissionsQuery.data?.filter((submission: any) => {
    const matchesSearch = submission.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.course_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || submission.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const createCourseMutation = useApiMutation({
    fn: async (data: typeof courseForm) => {
      const response = await facultyAPI.createCourse(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Course created successfully!");
      setShowCreateCourse(false);
      setCourseForm({
        courseCode: "",
        courseName: "",
        description: "",
        semester: "",
        credits: 3,
        maxStudents: 100
      });
      coursesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create course: ${extractApiError(error)}`);
    }
  });

  const markAttendanceMutation = useApiMutation({
    fn: async (data: any) => facultyAPI.markAttendance(data),
    onSuccess: () => {
      toast.success("Attendance recorded");
      setShowAttendanceDialog(false);
      if (selectedCourse) courseDetailsQuery.refetch();
    }
  });

  const updateMarksMutation = useApiMutation({
    fn: async (data: any) => facultyAPI.updateMarks(data.id, data.marks),
    onSuccess: () => {
      toast.success("Marks updated");
      setShowMarksDialog(false);
      if (selectedCourse) courseDetailsQuery.refetch();
    }
  });

  const courseDetailsQuery = useApiQuery({
    key: ["faculty", "course", selectedCourse?.id],
    fn: async () => {
      if (!selectedCourse) return null;
      const { data } = await facultyAPI.getCourseDetails(selectedCourse.id);
      return data;
    },
    enabled: !!selectedCourse
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCourseMutation.mutateAsync(courseForm);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, courseId: string) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleSyllabusUpload(files[0], courseId);
    }
  };

  const handleSyllabusUpload = async (file: File, courseId: string) => {
    try {
      // Simulate file upload
      toast.success(`Syllabus uploaded: ${file.name}`);
      
      // Update course modules for progress tracking
      const modules = [
        { id: 1, title: "Introduction to Cyber Security", completed: true },
        { id: 2, title: "Network Security Fundamentals", completed: false },
        { id: 3, title: "Cryptography Basics", completed: false },
        { id: 4, title: "Security Protocols", completed: false },
        { id: 5, title: "Risk Management", completed: false }
      ];
      
      setCourseModules(prev => ({
        ...prev,
        [courseId]: modules
      }));
      
      // Calculate progress based on completed modules
      const completedCount = modules.filter(m => m.completed).length;
      const progressPercentage = Math.round((completedCount / modules.length) * 100);
      
      // This would trigger real-time update to student dashboards
      toast.success(`Course materials updated. Progress: ${progressPercentage}%`);
      
      setShowSyllabusUpload(false);
      setSelectedCourseForSyllabus(null);
    } catch (error) {
      toast.error("Failed to upload syllabus");
    }
  };

  const toggleModuleCompletion = async (courseId: string, moduleId: number) => {
    setCourseModules(prev => {
      const updatedModules = prev[courseId]?.map(module => 
        module.id === moduleId ? { ...module, completed: !module.completed } : module
      ) || [];
      
      const completedCount = updatedModules.filter(m => m.completed).length;
      const progressPercentage = Math.round((completedCount / updatedModules.length) * 100);
      
      // Real-time sync to student dashboards
      toast.success(`Module ${!prev[courseId]?.find(m => m.id === moduleId)?.completed ? 'completed' : 'uncompleted'}. Course progress: ${progressPercentage}%`);
      
      return {
        ...prev,
        [courseId]: updatedModules
      };
    });
  };

  const handleMaterialUpload = async (files: File[]) => {
    try {
      // Simulate file upload
      const fileNames = files.map(f => f.name).join(', ');
      toast.success(`Uploading ${files.length} file(s): ${fileNames}`);
      
      // Calculate paper savings
      const totalPagesSaved = files.length * 25; // Assume 25 pages per file
      const co2Reduced = (totalPagesSaved * 0.006).toFixed(1); // 6g CO2 per page
      
      // Update sustainability metrics (would sync to Admin Dashboard)
      toast.success(`Environmental impact: ${totalPagesSaved} pages saved, ${co2Reduced}kg CO₂ reduced`);
      
      // Simulate real-time notification to students
      setTimeout(() => {
        toast.success('Students notified: New course materials available');
      }, 2000);
      
    } catch (error) {
      toast.error('Failed to upload materials');
    }
  };

  const isLoading = statsQuery.isLoading || coursesQuery.isLoading || submissionsQuery.isLoading;
  const error = statsQuery.error || coursesQuery.error || submissionsQuery.error;

  const statsCards = useMemo(() => {
    const stats = statsQuery.data;
    return [
      {
        icon: Leaf,
        label: "Papers Saved This Semester",
        value: facultyData?.papersSaved?.toLocaleString() || "0",
        color: "bg-green-100 text-green-600",
        trend: "+12%"
      },
      {
        icon: Users,
        label: "Total Students",
        value: facultyData?.totalStudents?.toLocaleString() || "0",
        color: "bg-blue-100 text-blue-600",
        trend: "+8%"
      },
      {
        icon: Target,
        label: "CO₂ Reduced",
        value: `${facultyData?.carbonReduction || 0}kg`,
        color: "bg-amber-100 text-amber-600",
        trend: "95%"
      },
      {
        icon: Award,
        label: "Student Rating",
        value: "4.8/5.0",
        color: "bg-purple-100 text-purple-600",
        trend: "A+"
      },
    ];
  }, [statsQuery.data, facultyData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Loading faculty dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-6 rounded-lg border border-border bg-white shadow-sm max-w-md text-center">
          <p className="text-red-600 font-semibold mb-2">Unable to load faculty data</p>
          <p className="text-sm text-muted-foreground">{extractApiError(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Create Course Dialog */}
      {showCreateCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold">Create New Course</h2>
            </div>
            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Course Code *</label>
                  <input
                    type="text" required
                    value={courseForm.courseCode}
                    onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value })}
                    placeholder="e.g., CS101"
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Semester</label>
                  <input
                    type="text"
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                    placeholder="e.g., Fall 2024"
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Course Name *</label>
                <input
                  type="text" required
                  value={courseForm.courseName}
                  onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })}
                  placeholder="e.g., Introduction to Computer Science"
                  className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  rows={3}
                  placeholder="Course description..."
                  className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Credits</label>
                  <input
                    type="number" min="1" max="6"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Students</label>
                  <input
                    type="number" min="1"
                    value={courseForm.maxStudents}
                    onChange={(e) => setCourseForm({ ...courseForm, maxStudents: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateCourse(false)} className="flex-1 px-6 py-2 rounded-lg border border-border hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createCourseMutation.isPending} className="flex-1 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50">
                  {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Syllabus Upload Modal */}
      {showSyllabusUpload && selectedCourseForSyllabus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Upload Syllabus</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload the latest syllabus for {selectedCourseForSyllabus.course_name}
            </p>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-primary/30 hover:border-primary/60'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, selectedCourseForSyllabus.id)}
            >
              <Upload className="w-12 h-12 text-primary/50 mx-auto mb-4" />
              <p className="font-semibold text-foreground mb-1">
                {isDragging ? 'Drop file here' : 'Drop syllabus file here'}
              </p>
              <p className="text-sm text-muted-foreground">PDF files only • Max 10MB</p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleSyllabusUpload(file, selectedCourseForSyllabus.id);
                }}
                className="hidden"
                id="syllabus-upload"
              />
              <label 
                htmlFor="syllabus-upload"
                className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer"
              >
                Browse Files
              </label>
            </div>
            
            {/* Sustainability Impact */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Leaf className="w-4 h-4" />
                <span className="font-semibold">Sustainability Impact</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Digital syllabus saves ~50 pages of paper per student • Reduces printing by 95%
              </p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => {
                  setShowSyllabusUpload(false);
                  setSelectedCourseForSyllabus(null);
                  setIsDragging(false);
                }} 
                className="flex-1 px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // Trigger file input
                  document.getElementById('syllabus-upload')?.click();
                }} 
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-blue-600/10 to-green-600/10 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Faculty Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {facultyData?.name || 'Faculty Member'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-semibold">{facultyData?.department || 'Computer Science'}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <button
                  onClick={() => window.location.href = "/register"}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="p-6 rounded-xl bg-white border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-full bg-opacity-20" style={{ backgroundColor: stat.color.includes('green') ? '#dcfce7' : stat.color.includes('blue') ? '#dbeafe' : stat.color.includes('amber') ? '#fef3c7' : '#f3e8ff' }}>
                      <Icon className={`w-6 h-6 ${stat.color.includes('green') ? 'text-green-600' : stat.color.includes('blue') ? 'text-blue-600' : stat.color.includes('amber') ? 'text-amber-600' : 'text-purple-600'}`} />
                    </div>
                    <span className="text-2xl font-bold text-green-600">{stat.trend}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg w-fit">
            {[
              { id: "courses", label: "My Courses", icon: BookOpen },
              { id: "submissions", label: "Student Submissions", icon: FileText },
              { id: "academic", label: "Attendance & Marks", icon: CalendarCheck },
              { id: "materials", label: "Course Materials", icon: FolderOpen },
              { id: "communications", label: "Communications", icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "courses" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">My Courses</h2>
                <button
                  onClick={() => setShowCreateCourse(true)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Course
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesQuery.data?.map((course: any) => {
                  const modules = courseModules[course.id] || [];
                  const completedCount = modules.filter(m => m.completed).length;
                  const progressPercentage = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : (course.progress || 65);
                  
                  return (
                    <div key={course.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{course.course_name}</h3>
                          <p className="text-sm text-muted-foreground">{course.course_code}</p>
                        </div>
                        <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Active
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{course.enrolled_students || 0} students enrolled</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Next: Mon, 10:00 AM</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Course Progress</span>
                          <span className="font-medium">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Module Progress Tracking */}
                      {modules.length > 0 && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-semibold mb-2">Course Modules</h4>
                          <div className="space-y-1">
                            {modules.map((module: any) => (
                              <div key={module.id} className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={module.completed}
                                  onChange={() => toggleModuleCompletion(course.id, module.id)}
                                  className="rounded"
                                />
                                <span className={module.completed ? "line-through text-muted-foreground" : ""}>
                                  {module.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedCourseForSyllabus(course);
                            setShowSyllabusUpload(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          <Upload className="w-3 h-3" />
                          Syllabus
                        </button>
                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors text-sm"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Digital Assignment Loop</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Leaf className="w-4 h-4" />
                    <span>Paperless Grading</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-green-600">156</span> papers saved this semester
                  </div>
                </div>
              </div>

              {/* Assignment Creation */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Create New Assignment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Assignment Title</label>
                    <input
                      type="text"
                      placeholder="Enter assignment title..."
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Course</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Select Course</option>
                      {coursesQuery.data?.map((course: any) => (
                        <option key={course.id} value={course.id}>
                          {course.course_code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Due Date</label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Points</label>
                    <input
                      type="number"
                      placeholder="100"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                    placeholder="Enter assignment description and requirements..."
                  />
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span>Notify students immediately</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Enable plagiarism detection</span>
                  </label>
                </div>
                <button 
                  onClick={() => {
                    toast.success('Assignment created and sent to 45 students');
                    setTimeout(() => {
                      toast.success('Paperless impact: ~135 pages saved, 0.8kg CO₂ reduced');
                    }, 1500);
                  }}
                  className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Create Assignment
                </button>
              </div>

              {/* Submissions Management */}
              <div className="bg-white rounded-lg border border-border">
                <div className="p-4 border-b border-border">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Student Submissions</h3>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search submissions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">All Status</option>
                        <option value="submitted">Submitted</option>
                        <option value="graded">Graded</option>
                        <option value="late">Late</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="divide-y">
                  {[
                    {
                      id: 1,
                      student_name: "Alice Johnson",
                      course_code: "CS101",
                      assignment_title: "Cyber Security Fundamentals",
                      submitted_at: "2025-02-26T10:30:00Z",
                      status: "graded",
                      grade: "A-",
                      papers_saved: 12,
                      co2_reduced: "0.07kg"
                    },
                    {
                      id: 2,
                      student_name: "Bob Smith",
                      course_code: "CS101",
                      assignment_title: "Network Security Analysis",
                      submitted_at: "2025-02-26T14:15:00Z",
                      status: "submitted",
                      grade: null,
                      papers_saved: 8,
                      co2_reduced: "0.05kg"
                    },
                    {
                      id: 3,
                      student_name: "Carol Davis",
                      course_code: "CS102",
                      assignment_title: "Cryptography Implementation",
                      submitted_at: null,
                      status: "pending",
                      grade: null,
                      papers_saved: 0,
                      co2_reduced: "0kg"
                    }
                  ].map((submission) => (
                    <div key={submission.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-foreground">{submission.student_name}</h4>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {submission.course_code}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              submission.status === "graded" ? "bg-green-100 text-green-800" :
                              submission.status === "submitted" ? "bg-blue-100 text-blue-800" :
                              submission.status === "late" ? "bg-orange-100 text-orange-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {submission.status === "graded" ? "Graded" :
                               submission.status === "submitted" ? "Submitted" :
                               submission.status === "late" ? "Late" : "Pending"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{submission.assignment_title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {submission.submitted_at 
                              ? `Submitted ${new Date(submission.submitted_at).toLocaleString()}`
                              : "Not submitted yet"
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          {submission.grade && (
                            <div className="text-lg font-bold text-green-600 mb-2">{submission.grade}</div>
                          )}
                          <div className="space-y-1">
                            <button className="text-sm font-medium text-primary hover:text-primary/80 block">
                              📄 View Submission
                            </button>
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-800 block">
                              ✏️ Grade Assignment
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Sustainability Impact */}
                      <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-green-700">
                            <Leaf className="w-3 h-3" />
                            <span className="font-medium">Environmental Impact</span>
                          </div>
                          <div className="text-green-600">
                            {submission.papers_saved} pages saved • {submission.co2_reduced} CO₂ reduced
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "academic" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Interactive Gradebook</h2>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Award className="w-4 h-4" />
                  <span>Real-time GPA Sync</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-2">
                  <h4 className="text-sm font-bold text-muted-foreground px-2">Select Course</h4>
                  {coursesQuery.data?.map(course => (
                    <button key={course.id} onClick={() => setSelectedCourse(course)} className={`w-full text-left p-3 rounded-lg border transition-all ${selectedCourse?.id === course.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-gray-50'}`}>
                      <div className="text-xs font-bold text-primary">{course.course_code}</div>
                      <div className="text-sm font-semibold truncate">{course.course_name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {(course as any).enrolled_students || 0} students
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="md:col-span-3">
                  {selectedCourse ? (
                    <div className="space-y-6">
                      {/* Grade Summary */}
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <BarChart className="w-5 h-5 text-blue-600" />
                          Grade Summary - {selectedCourse.course_code}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-700">85.2%</p>
                            <p className="text-sm text-blue-600">Average Score</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-700">3.42</p>
                            <p className="text-sm text-green-600">Average GPA</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-orange-700">78%</p>
                            <p className="text-sm text-orange-600">Attendance Rate</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-700">92%</p>
                            <p className="text-sm text-purple-600">Assignment Completion</p>
                          </div>
                        </div>
                      </div>

                      {/* Student Gradebook */}
                      <div className="bg-white rounded-lg border border-border">
                        <div className="p-4 border-b border-border">
                          <h3 className="text-lg font-semibold">Student Performance</h3>
                          <p className="text-sm text-muted-foreground">
                            Click on any student to view detailed analytics and update grades
                          </p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="border-b text-muted-foreground font-medium">
                                <th className="pb-3">Student</th>
                                <th className="pb-3">Attendance</th>
                                <th className="pb-3">Internal</th>
                                <th className="pb-3">Assignment</th>
                                <th className="pb-3">Total</th>
                                <th className="pb-3">Grade</th>
                                <th className="pb-3">GPA</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {[
                                { name: "Alice Johnson", email: "alice@university.edu", attendance: 85, internal: 42, assignment: 38, gpa: 3.5 },
                                { name: "Bob Smith", email: "bob@university.edu", attendance: 92, internal: 45, assignment: 44, gpa: 3.8 },
                                { name: "Carol Davis", email: "carol@university.edu", attendance: 78, internal: 38, assignment: 35, gpa: 3.2 },
                                { name: "David Wilson", email: "david@university.edu", attendance: 88, internal: 43, assignment: 41, gpa: 3.6 }
                              ].map((student, index) => {
                                const total = student.internal + student.assignment;
                                const grade = total >= 90 ? 'A' : total >= 80 ? 'B' : total >= 70 ? 'C' : total >= 60 ? 'D' : 'F';
                                const statusColor = student.attendance >= 75 ? 'text-green-600' : 'text-red-600';
                                
                                return (
                                  <tr key={index} className="hover:bg-gray-50/50">
                                    <td className="py-4">
                                      <div className="font-semibold">{student.name}</div>
                                      <div className="text-xs text-muted-foreground">{student.email}</div>
                                    </td>
                                    <td className="py-4">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{student.attendance}%</span>
                                        {student.attendance < 75 && (
                                          <span className={`text-xs ${statusColor} font-medium`}>
                                            ⚠️ Warning
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-4 font-medium">{student.internal}/50</td>
                                    <td className="py-4 font-medium">{student.assignment}/50</td>
                                    <td className="py-4 font-bold">{total}/100</td>
                                    <td className="py-4">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        grade === 'A' ? 'bg-green-100 text-green-800' :
                                        grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                        grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {grade}
                                      </span>
                                    </td>
                                    <td className="py-4 font-medium">{student.gpa}</td>
                                    <td className="py-4">
                                      <span className={`text-xs font-medium ${statusColor}`}>
                                        {student.attendance >= 75 ? 'Good' : 'At Risk'}
                                      </span>
                                    </td>
                                    <td className="py-4 font-medium">
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => { 
                                            setSelectedStudent(student); 
                                            setShowAttendanceDialog(true); 
                                          }} 
                                          className="p-2 rounded-md hover:bg-primary/10 text-primary" 
                                          title="Record Attendance"
                                        >
                                          <CalendarCheck className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => { 
                                            setSelectedStudent(student); 
                                            setMarksForm({ 
                                              internal_marks: student.internal, 
                                              assignment_total: student.assignment, 
                                              grade: grade, 
                                              progress: total 
                                            }); 
                                            setShowMarksDialog(true); 
                                          }} 
                                          className="p-2 rounded-md hover:bg-accent/10 text-accent" 
                                          title="Update Marks"
                                        >
                                          <Award className="w-4 h-4" />
                                        </button>
                                        <button 
                                          className="p-2 rounded-md hover:bg-blue-50 text-blue-600" 
                                          title="View AI Prediction"
                                        >
                                          <BarChart className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center rounded-lg border-2 border-dashed text-muted-foreground">
                      Select a course to view interactive gradebook and manage student performance
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "materials" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Course Materials</h2>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Leaf className="w-4 h-4" />
                  <span>Paperless Repository</span>
                </div>
              </div>

              {/* Upload Area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-primary/30 hover:border-primary/60'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    handleMaterialUpload(files);
                  }
                }}
              >
                <Upload className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isDragging ? 'Drop files here' : 'Upload Course Materials'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop PDFs, slides, videos, or any course materials
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.avi"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) handleMaterialUpload(files);
                  }}
                  className="hidden"
                  id="materials-upload"
                />
                <label 
                  htmlFor="materials-upload"
                  className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer"
                >
                  Browse Files
                </label>
              </div>

              {/* Recent Uploads */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Recent Uploads
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Introduction to Cyber Security.pdf", size: "2.4 MB", uploaded: "2 hours ago", students: 45 },
                    { name: "Network Security Fundamentals.pptx", size: "5.1 MB", uploaded: "1 day ago", students: 42 },
                    { name: "Lab Manual - Week 1.pdf", size: "1.2 MB", uploaded: "3 days ago", students: 38 }
                  ].map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size} • {file.uploaded}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {file.students} students
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sustainability Impact */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  Environmental Impact This Semester
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-700">2,840</p>
                    <p className="text-sm text-green-600">Pages Saved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-700">14.2kg</p>
                    <p className="text-sm text-blue-600">CO₂ Reduced</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-700">95%</p>
                    <p className="text-sm text-purple-600">Paper Reduction</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "communications" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Communications Hub</h2>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                  <span>Real-time Notifications</span>
                </div>
              </div>

              {/* Send Announcement */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  Send Announcement
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Course</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>All Courses</option>
                      {coursesQuery.data?.map((course: any) => (
                        <option key={course.id} value={course.id}>
                          {course.course_code} - {course.course_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Announcement Title</label>
                    <input
                      type="text"
                      placeholder="Enter announcement title..."
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea 
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none" 
                      rows={4} 
                      placeholder="Type your announcement to all enrolled students..." 
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      <span>Send email notification</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>Post to student dashboard</span>
                    </label>
                  </div>
                  <button 
                    onClick={() => {
                      toast.success('Announcement sent to 45 students');
                      setTimeout(() => {
                        toast.success('Real-time: Students received notification');
                      }, 1000);
                    }}
                    className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                  >
                    Send Announcement
                  </button>
                </div>
              </div>

              {/* Recent Announcements */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Recent Announcements
                </h3>
                <div className="space-y-3">
                  {[
                    { 
                      title: "Mid-term Exam Schedule", 
                      course: "Introduction to Cyber Security",
                      time: "30 minutes ago", 
                      students: 45,
                      read: 42
                    },
                    { 
                      title: "Assignment Deadline Extended", 
                      course: "Network Security Fundamentals",
                      time: "2 hours ago", 
                      students: 38,
                      read: 35
                    },
                    { 
                      title: "Guest Lecture Next Week", 
                      course: "All Courses",
                      time: "1 day ago", 
                      students: 120,
                      read: 118
                    }
                  ].map((announcement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{announcement.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {announcement.course} • {announcement.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {announcement.read}/{announcement.students} read
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAttendanceDialog && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Record Attendance: {selectedStudent.name}</h2>
            <div className="space-y-4">
              <input type="date" value={attendanceForm.date} onChange={e => setAttendanceForm({ ...attendanceForm, date: e.target.value })} className="w-full p-2 border rounded-md" />
              <select value={attendanceForm.status} onChange={e => setAttendanceForm({ ...attendanceForm, status: e.target.value })} className="w-full p-2 border rounded-md">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAttendanceDialog(false)} className="flex-1 px-4 py-2 border rounded-md">Cancel</button>
                <button onClick={() => markAttendanceMutation.mutate({ studentId: selectedStudent.id, courseId: selectedCourse.id, ...attendanceForm })} className="flex-1 px-4 py-2 bg-primary text-white rounded-md">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMarksDialog && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Update Data: {selectedStudent.name}</h2>
            <div className="space-y-4">
              <input type="number" placeholder="Internal Marks" value={marksForm.internal_marks} onChange={e => setMarksForm({ ...marksForm, internal_marks: Number(e.target.value) })} className="w-full p-2 border rounded-md" />
              <input type="number" placeholder="Assignment Total" value={marksForm.assignment_total} onChange={e => setMarksForm({ ...marksForm, assignment_total: Number(e.target.value) })} className="w-full p-2 border rounded-md" />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowMarksDialog(false)} className="flex-1 px-4 py-2 border rounded-md">Cancel</button>
                <button onClick={() => updateMarksMutation.mutate({ id: selectedStudent.enrollment_id || selectedStudent.id, marks: marksForm })} className="flex-1 px-4 py-2 bg-primary text-white rounded-md">Update</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
