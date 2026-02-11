import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import type { AuthenticatedUser } from "@shared/api";
import {
  AUTH_CHANGE_EVENT,
  clearAuthToken,
  storageKeys,
} from "@/lib/api";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const readUser = () => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(storageKeys.user);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthenticatedUser;
    } catch {
      return null;
    }
  };
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(
    () => readUser(),
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUser(readUser());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(AUTH_CHANGE_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(AUTH_CHANGE_EVENT, handleStorageChange);
    };
  }, []);

  const handleSignOut = () => {
    clearAuthToken();
    setCurrentUser(null);
    navigate("/login");
  };

  const isAuthPage = location.pathname === "/login";
  const isDashboard = location.pathname.includes("/dashboard");
  const isAuthenticated = Boolean(currentUser);

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-xl text-primary hover:text-primary/90"
            >
              <Leaf className="w-6 h-6" />
              <span>SAOP</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {!isDashboard && (
                <>
                  <Link
                    to="/"
                    className="text-sm font-medium hover:text-primary"
                  >
                    Home
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                  >
                    Sign In
                  </Link>
                </>
              )}
              {isDashboard && isAuthenticated && (
                <>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 text-sm"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </nav>

           
            <div className="md:hidden">
              {isDashboard && isAuthenticated ? (
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white font-medium hover:bg-red-600"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-1 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      {!isDashboard && (
        <footer className="border-t border-border bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  SAOP
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sustainable Academic Operations Platform
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Features</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link to="/" className="hover:text-primary">
                      Overview
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary">
                      API
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-primary">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary">
                      Community
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary">
                      Support
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-primary">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>
                &copy; 2024 Sustainable Academic Operations Platform. All rights
                reserved.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
