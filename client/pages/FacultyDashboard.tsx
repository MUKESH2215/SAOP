import { useState } from "react";
import { BookOpen, FileText, Users, Clock, MessageSquare, Upload, CheckCircle, Plus } from "lucide-react";

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState("courses");

  const courses = [
    {
      id: 1,
      code: "CS101",
      name: "Introduction to Computer Science",
      students: 85,
      assignments: 4,
      submissions: 73,
    },
    {
      id: 2,
      code: "CS201",
      name: "Data Structures",
      students: 62,
      assignments: 5,
      submissions: 58,
    },
    {
      id: 3,
      code: "CS301",
      name: "Algorithms",
      students: 48,
      assignments: 3,
      submissions: 45,
    },
  ];

  const recentSubmissions = [
    {
      id: 1,
      student: "Sarah Johnson",
      course: "CS101",
      assignment: "Assignment 2: Variables",
      submitted: "2 hours ago",
      status: "submitted",
    },
    {
      id: 2,
      student: "Michael Chen",
      course: "CS201",
      assignment: "Project 1: Array Implementation",
      submitted: "4 hours ago",
      status: "submitted",
    },
    {
      id: 3,
      student: "Emma Davis",
      course: "CS101",
      assignment: "Quiz 3",
      submitted: "1 day ago",
      status: "graded",
    },
    {
      id: 4,
      student: "James Wilson",
      course: "CS301",
      assignment: "Algorithm Analysis",
      submitted: "2 days ago",
      status: "submitted",
    },
  ];

  const stats = [
    { icon: BookOpen, label: "Active Courses", value: courses.length, color: "bg-primary/10 text-primary" },
    { icon: Users, label: "Total Students", value: courses.reduce((sum, c) => sum + c.students, 0), color: "bg-accent/10 text-accent" },
    { icon: FileText, label: "Pending Submissions", value: 28, color: "bg-blue-500/10 text-blue-500" },
    { icon: CheckCircle, label: "Graded", value: 142, color: "bg-green-500/10 text-green-500" },
  ];

  return (
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
            <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
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
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-lg bg-white border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
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
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
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
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-6 rounded-lg bg-white border border-border hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-sm font-semibold text-primary mb-1">
                        {course.code}
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        {course.name}
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
                        <div className="font-semibold">{course.students}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Assignments
                        </div>
                        <div className="font-semibold">{course.assignments}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Submissions
                        </div>
                        <div className="font-semibold">{course.submissions}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === "submissions" && (
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-6 rounded-lg bg-white border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {submission.student}
                      </h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        {submission.course} - {submission.assignment}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        submission.status === "graded"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {submission.status === "graded"
                        ? "Graded"
                        : "Submitted"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {submission.submitted}
                    </span>
                    <button className="text-sm font-medium text-primary hover:text-primary/80">
                      Review
                    </button>
                  </div>
                </div>
              ))}
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
                Upload lecture notes, presentations, and other course materials for your
                students.
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
  );
}
