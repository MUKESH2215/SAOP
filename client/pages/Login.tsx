import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Leaf,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Users,
  BookOpen,
} from "lucide-react";
import type { UserRole } from "@shared/api";
import { useToast } from "@/components/ui/use-toast";
import { extractApiError, useApiMutation } from "@/hooks/use-api";
import { authAPI, persistAuthUser, setAuthToken } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const loginMutation = useApiMutation({
    fn: async ({
      email: loginEmail,
      password: loginPassword,
      role,
    }: {
      email: string;
      password: string;
      role: UserRole;
    }) => {
      const { data } = await authAPI.login(loginEmail, loginPassword, role);
      return data;
    },
  });

  const handleRoleSelection = (role: UserRole) => {
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

    setError("");

    try {
      const data = await loginMutation.mutateAsync({
        email,
        password,
        role: selectedRole,
      });
      setAuthToken(data.token);
      persistAuthUser(data.user);

      toast({
        title: "Signed in successfully",
        description: `Welcome back, ${data.user.firstName}!`,
      });

      navigate(`/${data.user.role}/dashboard`);
    } catch (mutationError) {
      setError(extractApiError(mutationError));
    }
  };
  const isLoading = loginMutation.isPending;
  const apiError =
    loginMutation.error && !error
      ? extractApiError(loginMutation.error)
      : null;
  const displayError = error || apiError || "";

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
                      onClick={() => handleRoleSelection(role.id as UserRole)}
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
              {displayError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {displayError}
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
