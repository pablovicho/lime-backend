import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { initializeDatabase, closePool } from "./db/database";
import { errorHandler } from "./middleware/errorHandler";
import patientRoutes from "./routes/patientRoutes";
import noteRoutes from "./routes/noteRoutes";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "success",
    message: "AI Scribe Notes Management API",
    version: "1.0.0",
  });
});

app.use("/api/patients", patientRoutes);
app.use("/api/notes", noteRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`API: http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down...");
  await closePool();
  process.exit(0);
});

startServer();
