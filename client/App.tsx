import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />

            {/* Placeholder routes for features in development */}
            <Route
              path="/admin/students"
              element={
                <Placeholder
                  title="Student Management"
                  description="Manage and view student records"
                />
              }
            />
            <Route
              path="/admin/faculty"
              element={
                <Placeholder
                  title="Faculty Management"
                  description="Manage and view faculty records"
                />
              }
            />
            <Route
              path="/admin/schedule"
              element={
                <Placeholder
                  title="Academic Scheduling"
                  description="Create and manage timetables and exams"
                />
              }
            />
            <Route
              path="/faculty/courses"
              element={
                <Placeholder
                  title="Manage Courses"
                  description="Edit and configure your courses"
                />
              }
            />
            <Route
              path="/student/progress"
              element={
                <Placeholder
                  title="Academic Progress"
                  description="View your detailed academic progress and analytics"
                />
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
