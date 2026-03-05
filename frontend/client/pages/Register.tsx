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
  User,
  Phone,
  Calendar,
} from "lucide-react";
import type { UserRole } from "@shared/api";
import { useToast } from "@/components/ui/use-toast";
import { extractApiError, useApiMutation } from "@/hooks/use-api";
import { authAPI, persistAuthUser, setAuthToken } from "@/lib/api";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
  });
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const registerMutation = useApiMutation({
    fn: async (data: typeof formData & { role: UserRole }) => {
      try {
        const { data: responseData } = await authAPI.register({
          email: data.email,
          password: data.password,
          name: `${data.firstName} ${data.lastName}`,
          role: data.role
        });
        return responseData;
      } catch (error) {
        console.error('Registration error:', error);
        // Show more specific error message
        const errorMessage = extractApiError(error);
        setError(errorMessage || 'Registration failed. Please try again.');
        throw error; // Re-throw to trigger error state
      }
    },
  });

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    setError("");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      setError("Please select your role");
      return;
    }

    // Enhanced validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsRegistering(true);

    try {
      const data = await registerMutation.mutateAsync({
        ...formData,
        role: selectedRole,
      });

      toast({
        title: "Registration successful",
        description: `Welcome to SAOP, ${data.firstName}!`,
      });

      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (mutationError) {
      console.error('Registration error:', mutationError);
      const errorMessage = extractApiError(mutationError);
      setError(errorMessage || 'Registration failed. Please check your information and try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const isLoading = registerMutation.isPending;
  const apiError =
    registerMutation.error && !error
      ? extractApiError(registerMutation.error)
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
            <h1 className="text-2xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground text-sm">
              Join SAOP to access your academic portal
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-4">
                Select Your Role
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: "Admin",
                    label: "Administrator",
                    icon: Shield,
                    description: "Login with email + ID as password",
                  },
                  {
                    id: "Student",
                    label: "Student",
                    icon: BookOpen,
                    description: "Access your courses and materials",
                  },
                  {
                    id: "Faculty",
                    label: "Faculty / Teacher",
                    icon: Users,
                    description: "Manage courses & students",
                  },
                ].map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelection(role.id as UserRole)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left group ${isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-white hover:border-primary/50"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-5 h-5 ${isSelected
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-primary"
                            } transition-colors`}
                        />
                        <div>
                          <div className="font-semibold text-sm">{role.label}</div>
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

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {(displayError || registerMutation.error) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <div className="font-bold">{displayError}</div>
                  {registerMutation.error?.response?.data?.message && (
                    <div className="mt-1 opacity-90">{registerMutation.error.response.data.message}</div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="John"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Doe"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1234567890"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isRegistering}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading || isRegistering ? "Creating Account..." : "Create Account"}
                {!isLoading && !isRegistering && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </Link>
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
