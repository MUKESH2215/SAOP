import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Leaf,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Users,
  BookOpen,
} from "lucide-react";

type Role = "admin" | "faculty" | "student" | null;

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelection = (role: Role) => {
    setSelectedRole(role);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      setError("Please select your role");
      return;
    }

    if (!email || !password) {
      setError("Please enter your credentials");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate login - in a real app, this would call an API
    setTimeout(() => {
      setIsLoading(false);
      // Redirect based on role
      if (selectedRole === "admin") {
        navigate("/admin/dashboard");
      } else if (selectedRole === "faculty") {
        navigate("/faculty/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Leaf className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-primary">SAOP</span>
        </Link>

        <div className="bg-white rounded-lg border border-border shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border px-6 py-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">
              Sign in to your SAOP account
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Role Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-4">
                Select Your Role
              </label>
              <div className="space-y-3">
                {[
                  {
                    id: "admin",
                    label: "Administrator",
                    icon: Shield,
                    description: "Manage institution",
                  },
                  {
                    id: "faculty",
                    label: "Faculty",
                    icon: Users,
                    description: "Manage courses & students",
                  },
                  {
                    id: "student",
                    label: "Student",
                    icon: BookOpen,
                    description: "Access your courses",
                  },
                ].map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelection(role.id as Role)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left group ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-white hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-6 h-6 ${
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-primary"
                          } transition-colors`}
                        />
                        <div>
                          <div className="font-semibold">{role.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {role.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 group"
              >
                {isLoading ? "Signing in..." : "Sign In"}
                {!isLoading && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-sm mb-2 text-blue-900">
                Demo Credentials
              </h3>
              <p className="text-xs text-blue-700 mb-2">
                Email: <span className="font-mono">demo@saop.edu</span>
              </p>
              <p className="text-xs text-blue-700">
                Password: <span className="font-mono">demo123</span>
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <a
                  href="#"
                  className="text-primary font-semibold hover:underline"
                >
                  Contact your administrator
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
