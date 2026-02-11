import { useMemo, useState } from "react";
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
import { extractApiError, useApiQuery } from "@/hooks/use-api";
import { studentAPI } from "@/lib/api";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("courses");
  const statsQuery = useApiQuery({
    key: ["student", "stats"],
    fn: async () => {
      const { data } = await studentAPI.getStats();
      return data;
    },
  });
  const coursesQuery = useApiQuery({
    key: ["student", "courses"],
    fn: async () => {
      const { data } = await studentAPI.getCourses();
      return data;
    },
  });
  const assignmentsQuery = useApiQuery({
    key: ["student", "assignments"],
    fn: async () => {
      const { data } = await studentAPI.getAssignments();
      return data;
    },
  });
  const materialsQuery = useApiQuery({
    key: ["student", "materials"],
    fn: async () => {
      const { data } = await studentAPI.getMaterials();
      return data;
    },
  });
  const scheduleQuery = useApiQuery({
    key: ["student", "schedule"],
    fn: async () => {
      const { data } = await studentAPI.getSchedule();
      return data;
    },
  });

  const isLoading =
    statsQuery.isLoading ||
    coursesQuery.isLoading ||
    assignmentsQuery.isLoading ||
    materialsQuery.isLoading ||
    scheduleQuery.isLoading;
  const error =
    statsQuery.error ||
    coursesQuery.error ||
    assignmentsQuery.error ||
    materialsQuery.error ||
    scheduleQuery.error;

  const statsCards = useMemo(() => {
    const stats = statsQuery.data;
    return [
      {
        icon: BookOpen,
        label: "Enrolled Courses",
        value: stats?.activeCourses ?? 0,
        color: "bg-primary/10 text-primary",
      },
      {
        icon: FileText,
        label: "Pending Assignments",
        value: stats?.pendingAssignments ?? 0,
        color: "bg-orange-500/10 text-orange-500",
      },
      {
        icon: CheckCircle,
        label: "Completed",
        value: stats?.completedAssignments ?? 0,
        color: "bg-green-500/10 text-green-500",
      },
      {
        icon: BarChart3,
        label: "GPA",
        value: stats ? stats.gpa.toFixed(2) : "0.00",
        color: "bg-accent/10 text-accent",
      },
    ];
  }, [statsQuery.data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Loading student dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-6 rounded-lg border border-border bg-white shadow-sm max-w-md text-center">
          <p className="text-red-600 font-semibold mb-2">
            Unable to load your data
          </p>
          <p className="text-sm text-muted-foreground">
            {extractApiError(error)}
          </p>
        </div>
      </div>
    );
  }

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
              {coursesQuery.data?.map((course) => (
                <div
                  key={course.id}
                  className="p-6 rounded-lg bg-white border border-border hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-primary mb-1">
                        {course.course_code}
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {course.course_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Instructor: {course.instructor || "TBA"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-accent mb-1">
                        {course.grade ?? "N/A"}
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
                        {course.progress ?? 0}%
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
              {!coursesQuery.data?.length && (
                <div className="p-6 rounded-lg bg-white border border-border text-center text-muted-foreground">
                  You are not enrolled in any courses yet.
                </div>
              )}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === "assignments" && (
            <div className="space-y-4">
              {assignmentsQuery.data?.map((assignment) => {
                const dueDate = new Date(assignment.due_date);
                const diffMs = dueDate.getTime() - Date.now();
                const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                const isSubmitted = assignment.status !== "pending";

                return (
                  <div
                    key={assignment.id}
                    className={`p-6 rounded-lg border ${
                      isSubmitted
                        ? "bg-green-50 border-green-200"
                        : daysLeft <= 2
                          ? "bg-orange-50 border-orange-200"
                          : "bg-white border-border"
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                            {assignment.course_code}
                          </span>
                          {isSubmitted && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {!isSubmitted && daysLeft <= 2 && (
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {assignment.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Due: {dueDate.toLocaleDateString()}
                          </span>
                          {!isSubmitted && (
                            <span className="font-medium">
                              {daysLeft <= 0
                                ? "Due Today!"
                                : `${daysLeft} days left`}
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 text-sm whitespace-nowrap">
                        {isSubmitted ? "View Submission" : "Submit"}
                      </button>
                    </div>
                  </div>
                );
              })}
              {!assignmentsQuery.data?.length && (
                <div className="p-6 rounded-lg bg-white border border-border text-center text-muted-foreground">
                  No assignments found.
                </div>
              )}
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === "materials" && (
            <div className="space-y-4">
              {materialsQuery.data?.map((material) => (
                <div
                  key={material.id}
                  className="p-6 rounded-lg bg-white border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            material.file_type.toUpperCase() === "PDF"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {material.file_type}
                        </span>
                        <span className="text-xs font-semibold text-primary">
                          {material.course_code}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {material.title}
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        Shared on{" "}
                        {new Date(material.uploaded_at).toLocaleDateString()}{" "}
                        {material.file_size ? `(${material.file_size})` : ""}
                      </div>
                    </div>
                    <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {!materialsQuery.data?.length && (
                <div className="p-6 rounded-lg bg-white border border-border text-center text-muted-foreground">
                  No learning materials available yet.
                </div>
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === "schedule" && (
            <div className="space-y-4">
              {scheduleQuery.data?.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 rounded-lg border ${
                    item.event_type === "exam"
                      ? "bg-orange-50 border-orange-200"
                      : "bg-white border-border"
                  } hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {item.event_type === "exam" ? (
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                        ) : (
                          <Calendar className="w-5 h-5 text-primary" />
                        )}
                        <span className="text-sm font-semibold text-primary">
                          {item.course_code}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">
                        {item.event_name}
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          {item.day_of_week ? `${item.day_of_week} ` : ""}
                          {item.start_time
                            ? new Date(
                                `1970-01-01T${item.start_time}`,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </p>
                        <p>
                          {item.event_date
                            ? new Date(item.event_date).toDateString()
                            : ""}
                        </p>
                        <p>{item.location || "TBA"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!scheduleQuery.data?.length && (
                <div className="p-6 rounded-lg bg-white border border-border text-center text-muted-foreground">
                  No schedule items to display.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
