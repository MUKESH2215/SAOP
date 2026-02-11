import { Link } from "react-router-dom";
import {
  Leaf,
  BookOpen,
  Users,
  BarChart3,
  Zap,
  Shield,
  GraduationCap,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-16 pb-16">

      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/5 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Sustainable Excellence
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            Academic Operations
            <span className="block pb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Reimagined
            </span>

          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The Sustainable Academic Operations Platform transforms educational
            institutions with efficient, transparent, and eco-friendly digital
            workflows. Empower administrators, faculty, and students with a
            unified platform built for the future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/login"
              className="px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 group"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-lg bg-secondary/20 text-secondary font-semibold hover:bg-secondary/30 transition-colors border border-secondary/50"
            >
              Learn More
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-sm">
            <div className="p-3 bg-white/50 rounded-lg border border-border">
              <div className="font-bold text-primary">10K+</div>
              <div className="text-muted-foreground">Institutions</div>
            </div>
            <div className="p-3 bg-white/50 rounded-lg border border-border">
              <div className="font-bold text-accent">500K+</div>
              <div className="text-muted-foreground">Users</div>
            </div>
            <div className="p-3 bg-white/50 rounded-lg border border-border">
              <div className="font-bold text-primary">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage academic operations efficiently and
            sustainably
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: "Role-Based Access",
              description:
                "Dedicated dashboards for Admins, Faculty, and Students with tailored features for each role",
            },
            {
              icon: BookOpen,
              title: "Digital Learning",
              description:
                "Upload materials, create assignments, and manage assessments in a centralized platform",
            },
            {
              icon: BarChart3,
              title: "Analytics & Tracking",
              description:
                "Monitor academic progress, performance metrics, and institutional sustainability goals",
            },
            {
              icon: Clock,
              title: "Smart Scheduling",
              description:
                "Optimize timetables and exam schedules to reduce resource usage and conflicts",
            },
            {
              icon: Zap,
              title: "Real-Time Notifications",
              description:
                "Instant updates on assignments, schedules, and important academic announcements",
            },
            {
              icon: Leaf,
              title: "Eco-Friendly Design",
              description:
                "Paperless workflows and optimized resource management for sustainable operations",
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-lg border border-border bg-white hover:shadow-lg transition-shadow"
              >
                <Icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Roles Section */}
      <section className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Tailored for Every Role</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Optimized experiences designed for administrators, faculty, and
              students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                role: "Administrators",
                icon: Shield,
                points: [
                  "Manage student and faculty records",
                  "Create academic schedules",
                  "Monitor sustainability metrics",
                  "Generate institution-wide reports",
                  "System configuration & oversight",
                ],
              },
              {
                role: "Faculty",
                icon: GraduationCap,
                points: [
                  "Upload course materials",
                  "Create and manage assignments",
                  "Track student submissions",
                  "Grade assessments",
                  "Communicate with students",
                ],
              },
              {
                role: "Students",
                icon: BookOpen,
                points: [
                  "Access learning materials",
                  "View course schedules",
                  "Submit assignments online",
                  "Check academic progress",
                  "Receive notifications",
                ],
              },
            ].map((roleInfo, index) => {
              const Icon = roleInfo.icon;
              return (
                <div
                  key={index}
                  className="p-8 rounded-lg border border-border bg-white"
                >
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-2xl font-bold mb-4">{roleInfo.role}</h3>
                  <ul className="space-y-3">
                    {roleInfo.points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sustainability Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Sustainable Excellence</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with environmental responsibility at the core
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Paperless Operations</h3>
            <p className="text-muted-foreground mb-6">
              Eliminate paper waste with fully digital workflows for all
              academic processes—from assignments to examinations. Track and
              reduce your institution's environmental footprint.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Digital submissions and grading</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Electronic report generation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Carbon footprint tracking</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-lg bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
            <h3 className="text-2xl font-bold mb-4">Resource Optimization</h3>
            <p className="text-muted-foreground mb-6">
              Optimize scheduling to minimize resource usage. Intelligent
              algorithms reduce conflicts, improve facility utilization, and
              lower operational costs.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>Smart timetable generation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>Facility utilization analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>Energy usage monitoring</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-accent rounded-2xl overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of educational institutions using SAOP to improve
            efficiency, enhance transparency, and promote sustainable practices.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-4 rounded-lg bg-white text-primary font-semibold hover:bg-white/90 transition-colors"
          >
            Start Your Journey Today
          </Link>
        </div>
      </section>
    </div>
  );
}
