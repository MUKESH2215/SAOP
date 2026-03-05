import { useNavigate, Link } from "react-router-dom";
import {
  Leaf,
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
              Sustainable Academic Operations Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Streamline institutional management with our eco-friendly,
              comprehensive solution for students and faculty.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all flex items-center gap-2"
              >
                Sign In <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#features"
                className="px-8 py-4 rounded-lg bg-white border border-border font-bold text-lg hover:bg-gray-50 transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">10k+</div>
              <div className="text-sm text-muted-foreground uppercase font-semibold">
                Active Students
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground uppercase font-semibold">
                Faculty Members
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground uppercase font-semibold">
                Institutions
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground uppercase font-semibold">
                System Uptime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Platform Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Everything you need to manage your academic ecosystem efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Scheduling</h3>
              <p className="text-muted-foreground">
                Automated timetable generation and exam scheduling optimized for
                resource efficiency.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Material Repository</h3>
              <p className="text-muted-foreground">
                Centralized paperless library for all study materials, courses,
                and assignments.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Real-time tracking of student performance and faculty engagement
                data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-based Access Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Designed for Everyone</h2>
              <div className="space-y-6">
                <div className="flex gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Administrators</h4>
                    <p className="text-muted-foreground text-sm">
                      Total control over institutional settings, user
                      management, and comprehensive oversight.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="bg-accent/10 p-3 rounded-lg flex-shrink-0">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Faculty</h4>
                    <p className="text-muted-foreground text-sm">
                      Simplified attendance, course management, and direct
                      student engagement tools.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Students</h4>
                    <p className="text-muted-foreground text-sm">
                      One-stop portal for schedules, materials, grades, and
                      academic communication.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-3xl absolute inset-0 -z-10" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-2xl border border-border shadow-md">
                    <CheckCircle className="w-10 h-10 text-primary mb-4" />
                    <p className="font-bold">Paperless Operation</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-border shadow-md">
                    <CheckCircle className="w-10 h-10 text-accent mb-4" />
                    <p className="font-bold">Automated Sync</p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-white p-6 rounded-2xl border border-border shadow-md">
                    <CheckCircle className="w-10 h-10 text-blue-500 mb-4" />
                    <p className="font-bold">Secure Access</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-border shadow-md">
                    <CheckCircle className="w-10 h-10 text-amber-500 mb-4" />
                    <p className="font-bold">Real-time Data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Leaf className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6 italic">
            "Towards Sustainable Academic excellence"
          </h2>
          <p className="text-xl max-w-2xl mx-auto opacity-90 leading-relaxed mb-10">
            SAOP helps institutions reduce their carbon footprint by digitizing
            administrative workflows and academic resources.
          </p>
          <div className="flex justify-center gap-12 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">~65%</div>
              <div className="text-sm uppercase font-semibold">
                Paper Reduction
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">40%</div>
              <div className="text-sm uppercase font-semibold">
                Time Efficiency
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to modernize your institution?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Join the growing community of institutions embracing sustainable
            management with SAOP.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-10 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-xl hover:bg-primary/90 shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
