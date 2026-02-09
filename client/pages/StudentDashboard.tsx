import { useState } from "react";
import {
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("courses");

  const enrolledCourses = [
    {
      id: 1,
      code: "CS101",
      name: "Introduction to Computer Science",
      instructor: "Dr. Sarah Smith",
      progress: 75,
      grade: "A-",
    },
    {
      id: 2,
      code: "CS201",
      name: "Data Structures",
      instructor: "Dr. James Chen",
      progress: 68,
      grade: "B+",
    },
    {
      id: 3,
      code: "MATH101",
      name: "Calculus I",
      instructor: "Prof. Emily Davis",
      progress: 82,
      grade: "A",
    },
  ];

  const upcomingAssignments = [
    {
      id: 1,
      course: "CS101",
      title: "Assignment 3: Functions",
      dueDate: "2024-02-15",
      daysLeft: 3,
      submitted: false,
      status: "pending",
    },
    {
      id: 2,
      course: "CS201",
      title: "Project 2: Sorting Algorithms",
      dueDate: "2024-02-18",
      daysLeft: 6,
      submitted: false,
      status: "pending",
    },
    {
      id: 3,
      course: "MATH101",
      title: "Quiz 4",
      dueDate: "2024-02-10",
      daysLeft: 0,
      submitted: true,
      status: "submitted",
    },
  ];

  const learningMaterials = [
    {
      id: 1,
      course: "CS101",
      type: "PDF",
      title: "Lecture Notes - Week 4",
      size: "2.4 MB",
      uploadedBy: "Dr. Sarah Smith",
    },
    {
      id: 2,
      course: "CS201",
      type: "VIDEO",
      title: "Data Structures Basics - Part 1",
      size: "145 MB",
      uploadedBy: "Dr. James Chen",
    },
    {
      id: 3,
      course: "CS101",
      type: "PDF",
      title: "Practical Examples",
      size: "1.8 MB",
      uploadedBy: "Dr. Sarah Smith",
    },
  ];

  const academicSchedule = [
    {
      id: 1,
      type: "class",
      course: "CS101",
      event: "Lecture",
      dayTime: "Monday 10:00 AM",
      location: "Room 201",
    },
    {
      id: 2,
      type: "class",
      course: "CS201",
      event: "Lab",
      dayTime: "Wednesday 2:00 PM",
      location: "Lab A",
    },
    {
      id: 3,
      type: "exam",
      course: "MATH101",
      event: "Midterm Exam",
      dayTime: "February 25, 2024",
      location: "Auditorium",
    },
  ];

  const stats = [
    {
      icon: BookOpen,
      label: "Enrolled Courses",
      value: enrolledCourses.length,
      color: "bg-primary/10 text-primary",
    },
    {
      icon: FileText,
      label: "Pending Assignments",
      value: 2,
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: 18,
      color: "bg-green-500/10 text-green-500",
    },
    {
      icon: BarChart3,
      label: "GPA",
      value: "3.85",
      color: "bg-accent/10 text-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Student Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome! Access your courses and track your academic progress
              </p>
            </div>
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
            { id: "assignments", label: "Assignments" },
            { id: "materials", label: "Learning Materials" },
            { id: "schedule", label: "Schedule & Exams" },
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
              {enrolledCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-6 rounded-lg bg-white border border-border hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-primary mb-1">
                        {course.code}
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {course.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Instructor: {course.instructor}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-accent mb-1">
                        {course.grade}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Current Grade
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">
                        Course Progress
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {course.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 text-sm">
                    View Course
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === "assignments" && (
            <div className="space-y-4">
              {upcomingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className={`p-6 rounded-lg border ${
                    assignment.status === "submitted"
                      ? "bg-green-50 border-green-200"
                      : assignment.daysLeft <= 2
                        ? "bg-orange-50 border-orange-200"
                        : "bg-white border-border"
                  } hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                          {assignment.course}
                        </span>
                        {assignment.status === "submitted" && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {assignment.daysLeft <= 2 &&
                          assignment.status !== "submitted" && (
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                          )}
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {assignment.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Due: {assignment.dueDate}
                        </span>
                        {assignment.status !== "submitted" && (
                          <span className="font-medium">
                            {assignment.daysLeft === 0
                              ? "Due Today!"
                              : `${assignment.daysLeft} days left`}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 text-sm whitespace-nowrap">
                      {assignment.status === "submitted"
                        ? "View Submission"
                        : "Submit"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === "materials" && (
            <div className="space-y-4">
              {learningMaterials.map((material) => (
                <div
                  key={material.id}
                  className="p-6 rounded-lg bg-white border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            material.type === "PDF"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {material.type}
                        </span>
                        <span className="text-xs font-semibold text-primary">
                          {material.course}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {material.title}
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        Shared by {material.uploadedBy} ({material.size})
                      </div>
                    </div>
                    <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === "schedule" && (
            <div className="space-y-4">
              {academicSchedule.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 rounded-lg border ${
                    item.type === "exam"
                      ? "bg-orange-50 border-orange-200"
                      : "bg-white border-border"
                  } hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {item.type === "exam" ? (
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                        ) : (
                          <Calendar className="w-5 h-5 text-primary" />
                        )}
                        <span className="text-sm font-semibold text-primary">
                          {item.course}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">
                        {item.event}
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{item.dayTime}</p>
                        <p>{item.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
