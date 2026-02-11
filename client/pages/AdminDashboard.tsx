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
} from "lucide-react";
import { adminAPI } from "@/lib/api";
import { extractApiError, useApiQuery } from "@/hooks/use-api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const statsQuery = useApiQuery({
    key: ["admin", "stats"],
    fn: async () => {
      const { data } = await adminAPI.getStats();
      return data;
    },
  });
  const studentsQuery = useApiQuery({
    key: ["admin", "students"],
    fn: async () => {
      const { data } = await adminAPI.getStudents();
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
  const activitiesQuery = useApiQuery({
    key: ["admin", "activities"],
    fn: async () => {
      const { data } = await adminAPI.getActivities();
      return data;
    },
  });

  const isLoading =
    statsQuery.isLoading ||
    studentsQuery.isLoading ||
    facultyQuery.isLoading ||
    activitiesQuery.isLoading;

  const error =
    statsQuery.error ||
    studentsQuery.error ||
    facultyQuery.error ||
    activitiesQuery.error;

  const stats = statsQuery.data || {
    totalStudents: 0,
    totalFaculty: 0,
    activeCourses: 0,
    papersSaved: 0,
  };

  const statsCards = useMemo(
    () => [
      {
        icon: Users,
        label: "Total Students",
        value: stats.totalStudents.toLocaleString(),
        color: "bg-primary/10 text-primary",
      },
      {
        icon: GraduationCap,
        label: "Faculty Members",
        value: stats.totalFaculty.toLocaleString(),
        color: "bg-accent/10 text-accent",
      },
      {
        icon: BookOpen,
        label: "Active Courses",
        value: stats.activeCourses.toLocaleString(),
        color: "bg-blue-500/10 text-blue-500",
      },
      {
        icon: Leaf,
        label: "Papers Saved",
        value: stats.papersSaved.toLocaleString(),
        color: "bg-green-500/10 text-green-500",
      },
    ],
    [stats],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Loading admin dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-6 rounded-lg border border-border bg-white shadow-sm max-w-md text-center">
          <p className="text-red-600 font-semibold mb-2">
            Unable to load dashboard
          </p>
          <p className="text-sm text-muted-foreground">
            {extractApiError(error)}
          </p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: Users, label: "Manage Students", href: "#" },
    { icon: GraduationCap, label: "Manage Faculty", href: "#" },
    { icon: Calendar, label: "Create Schedule", href: "#" },
    { icon: FileText, label: "Generate Reports", href: "#" },
    { icon: Settings, label: "System Settings", href: "#" },
    { icon: Leaf, label: "Sustainability", href: "#" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Administrator Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your institution's academic operations
              </p>
            </div>
            <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
              <Plus className="w-5 h-5 inline mr-2" />
              New Action
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
                  <span className="text-xs font-medium text-muted-foreground">
                    Real-time
                  </span>
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
            { id: "overview", label: "Overview" },
            { id: "management", label: "Data Management" },
            { id: "scheduling", label: "Scheduling" },
            { id: "reports", label: "Reports" },
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

        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Quick Actions */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <a
                        key={index}
                        href={action.href}
                        className="p-4 rounded-lg bg-white border border-border text-center hover:border-primary hover:shadow-lg transition-all group cursor-pointer"
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-sm font-medium text-foreground">
                          {action.label}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activities */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Recent Activities</h2>
                <div className="space-y-4">
                  {activitiesQuery.data?.map((activity, index) => (
                    <div
                      key={`${activity.timestamp}-${index}`}
                      className="p-4 rounded-lg bg-white border border-border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {activity.details || activity.type}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {activity.user_name || "System"}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Management Tab */}
          {activeTab === "management" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg bg-white border border-border">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Recent Students
                </h3>
                <div className="space-y-4">
                  {studentsQuery.data?.slice(0, 5).map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between border-b last:border-b-0 pb-3 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold text-sm">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.email}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(student.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {!studentsQuery.data?.length && (
                    <p className="text-sm text-muted-foreground">
                      No student records found.
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 rounded-lg bg-white border border-border">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-accent" />
                  Active Faculty
                </h3>
                <div className="space-y-4">
                  {facultyQuery.data?.slice(0, 5).map((faculty) => (
                    <div
                      key={faculty.id}
                      className="flex items-center justify-between border-b last:border-b-0 pb-3 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold text-sm">
                          {faculty.first_name} {faculty.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {faculty.email}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {faculty.course_count} courses
                      </span>
                    </div>
                  ))}
                  {!facultyQuery.data?.length && (
                    <p className="text-sm text-muted-foreground">
                      No faculty members to display.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Scheduling Tab */}
          {activeTab === "scheduling" && (
            <div className="p-6 rounded-lg bg-white border border-border">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                Academic Scheduling
              </h3>
              <p className="text-muted-foreground mb-4">
                Create optimized timetables and exam schedules to minimize
                resource usage and conflicts.
              </p>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg text-center text-muted-foreground">
                <p>Scheduling features - detailed interface coming soon</p>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="p-6 rounded-lg bg-white border border-border">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                Analytics & Reports
              </h3>
              <p className="text-muted-foreground mb-4">
                Generate comprehensive reports on academic operations and
                sustainability metrics.
              </p>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg text-center text-muted-foreground">
                <p>Reports interface - detailed analytics coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
