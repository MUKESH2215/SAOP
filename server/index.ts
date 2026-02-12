import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import authRouter from "./routes/auth";
import adminRouter from "./routes/admin";
import facultyRouter from "./routes/faculty";
import studentRouter from "./routes/student";
import { testConnection } from "./config/database";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Database readiness check
  void testConnection();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Primary application routes
  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/faculty", facultyRouter);
  app.use("/api/student", studentRouter);

  return app;
}
