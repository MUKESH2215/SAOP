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
} from "lucide-react";
import { extractApiError, useApiQuery, useApiMutation } from "@/hooks/use-api";
import { facultyAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState("courses");
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    courseCode: "",
    courseName: "",
    description: "",
    semester: "",
    credits: 3,
    maxStudents: 100
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

  const { toast } = useToast();
  const createCourseMutation = useApiMutation({
    fn: async (data: typeof courseForm) => {
      const response = await facultyAPI.createCourse(data);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Course created successfully!" });
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
      toast({ title: "Failed to create course", description: extractApiError(error), variant: "destructive" });
    }
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCourseMutation.mutateAsync(courseForm);
  };

  const isLoading =
    statsQuery.isLoading || coursesQuery.isLoading || submissionsQuery.isLoading;
  const error = statsQuery.error || coursesQuery.error || submissionsQuery.error;

  const statsCards = useMemo(() => {
    const stats = statsQuery.data;
    return [
      {
        icon: BookOpen,
        label: "Active Courses",
        value: stats?.activeCourses ?? 0,
        color: "bg-primary/10 text-primary",
      },
      {
        icon: Users,
        label: "Total Students",
        value: stats?.totalStudents ?? 0,
        color: "bg-accent/10 text-accent",
      },
      {
        icon: FileText,
        label: "Pending Submissions",
        value: stats?.pendingSubmissions ?? 0,
        color: "bg-blue-500/10 text-blue-500",
      },
      {
        icon: CheckCircle,
        label: "Graded",
        value: stats?.graded ?? 0,
        color: "bg-green-500/10 text-green-500",
      },
    ];
  }, [statsQuery.data]);

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
          <p className="text-red-600 font-semibold mb-2">
            Unable to load faculty data
          </p>
          <p className="text-sm text-muted-foreground">
            {extractApiError(error)}
          </p>
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
                    type="text"
                    required
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
                  type="text"
                  required
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
                    type="number"
                    min="1"
                    max="6"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Students</label>
                  <input
                    type="number"
                    min="1"
                    value={courseForm.maxStudents}
                    onChange={(e) => setCourseForm({ ...courseForm, maxStudents: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateCourse(false)}
                  className="flex-1 px-6 py-2 rounded-lg border border-border hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCourseMutation.isPending}
                  className="flex-1 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50"
                >
                  {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background">
        {/* Dashboard Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Faculty Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Manage your courses and student submissions
                </p>
              </div>
              <button
                onClick={() => setShowCreateCourse(true)}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                New Course
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-lg bg-white border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <h3 className="text-3xl font-bold mb-1">
                    {stat.value.toLocaleString
                      ? stat.value.toLocaleString()
                      : stat.value}
                  </h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="mb-8 border-b border-border flex gap-4 overflow-x-auto">
            {[
              { id: "courses", label: "My Courses" },
              { id: "submissions", label: "Student Submissions" },
              { id: "materials", label: "Course Materials" },
              { id: "communications", label: "Communications" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Courses Tab */}
            {activeTab === "courses" && (
              <div className="space-y-4">
                {coursesQuery.data?.map((course) => (
                  <div
                    key={course.id}
                    className="p-6 rounded-lg bg-white border border-border hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-sm font-semibold text-primary mb-1">
                          {course.course_code}
                        </div>
                        <h3 className="text-xl font-bold text-foreground">
                          {course.course_name}
                        </h3>
                      </div>
                      <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20">
                        Manage
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Students
                          </div>
                          <div className="font-semibold">
                            {course.students ?? 0}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Assignments
                          </div>
                          <div className="font-semibold">
                            {course.assignments ?? 0}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Submissions
                          </div>
                          <div className="font-semibold">
                            {course.submissions ?? 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!coursesQuery.data?.length && (
                  <div className="p-6 rounded-lg bg-white border border-border text-center text-muted-foreground">
                    You have not created any courses yet.
                  </div>
                )}
              </div>
            )}

            {/* Submissions Tab */}
            {activeTab === "submissions" && (
              <div className="space-y-4">
                {submissionsQuery.data?.map((submission) => (
                  <div
                    key={submission.id}
                    className="p-6 rounded-lg bg-white border border-border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {submission.student_name}
                        </h3>
                        <div className="text-sm text-muted-foreground mt-1">
                          {submission.course_code} - {submission.assignment_title}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${submission.status === "graded"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                          }`}
                      >
                        {submission.status === "graded" ? "Graded" : "Submitted"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {submission.submitted_at
                          ? new Date(submission.submitted_at).toLocaleString()
                          : "Pending submission"}
                      </span>
                      <button className="text-sm font-medium text-primary hover:text-primary/80">
                        Review
                      </button>
                    </div>
                  </div>
                ))}
                {!submissionsQuery.data?.length && (
                  <div className="p-6 rounded-lg bg-white border border-border text-center text-muted-foreground">
                    No recent submissions found.
                  </div>
                )}
              </div>
            )}

            {/* Materials Tab */}
            {activeTab === "materials" && (
              <div className="p-6 rounded-lg bg-white border border-border">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Upload className="w-6 h-6 text-primary" />
                  Upload Course Materials
                </h3>
                <p className="text-muted-foreground mb-6">
                  Upload lecture notes, presentations, and other course materials
                  for your students.
                </p>
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/60 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                  <p className="font-semibold text-foreground mb-1">
                    Drop your files here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse (PDF, PPT, DOC, etc.)
                  </p>
                </div>
              </div>
            )}

            {/* Communications Tab */}
            {activeTab === "communications" && (
              <div className="space-y-4">
                <div className="p-6 rounded-lg bg-white border border-border">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Send Announcement
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Select Course
                      </label>
                      <select className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option>CS101 - Introduction to Computer Science</option>
                        <option>CS201 - Data Structures</option>
                        <option>CS301 - Algorithms</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Message
                      </label>
                      <textarea
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        rows={4}
                        placeholder="Type your announcement..."
                      />
                    </div>
                    <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                      Send Announcement
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
