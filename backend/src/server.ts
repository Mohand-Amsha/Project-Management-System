import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/database.js";
import { User, Organization } from "./models/index.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import { projectTaskRoutes, taskRoutes } from "./routes/task.routes.js";
import memberRoutes from "./routes/member.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects/:projectId/tasks", projectTaskRoutes);

// Must come after all routes: 404 for unknown paths, then the JSON error handler
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

const startServer = async (): Promise<void> => {
  await connectDB();

  console.log("📦 Models registered:", {
    User: User.modelName,
    Organization: Organization.modelName,
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
