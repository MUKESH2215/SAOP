import { useState } from "react";
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    { icon: Users, label: "Total Students", value: "3,245", color: "bg-primary/10 text-primary" },
    { icon: GraduationCap, label: "Faculty Members", value: "287", color: "bg-accent/10 text-accent" },
    { icon: BookOpen, label: "Active Courses", value: "156", color: "bg-blue-500/10 text-blue-500" },
    { icon: Leaf, label: "Papers Saved", value: "45.2K", color: "bg-green-500/10 text-green-500" },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "user",
      title: "New student enrollment",
      description: "48 new students enrolled in Spring 2024",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "schedule",
      title: "Timetable published",
      description: "Spring 2024 timetable published to all students",
      timestamp: "5 hours ago",
    },
    {
      id: 3,
      type: "system",
      title: "System backup completed",
      description: "Daily backup of academic records completed successfully",
      timestamp: "1 day ago",
    },
    {
      id: 4,
      type: "metric",
      title: "Sustainability milestone",
      description: "Reached 95% paperless operations",
      timestamp: "3 days ago",
    },
  ];

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
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-lg bg-white border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                  <span className="text-xs font-medium text-muted-foreground">
                    This Month
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
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 rounded-lg bg-white border border-border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {activity.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                          {activity.timestamp}
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
                  Student Management
                </h3>
                <p className="text-muted-foreground mb-4">
                  Add, update, and view student records. Import bulk data from CSV files.
                </p>
                <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90">
                  Manage Students
                </button>
              </div>

              <div className="p-6 rounded-lg bg-white border border-border">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-accent" />
                  Faculty Management
                </h3>
                <p className="text-muted-foreground mb-4">
                  Manage faculty profiles, assignments, and course allocations.
                </p>
                <button className="px-4 py-2 rounded-lg bg-accent text-primary-foreground font-medium hover:bg-accent/90">
                  Manage Faculty
                </button>
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
                Create optimized timetables and exam schedules to minimize resource usage
                and conflicts.
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
                Generate comprehensive reports on academic operations and sustainability
                metrics.
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
