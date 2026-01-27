import express from "express";
import cors from "cors";
import { env } from "./lib/envConfig.js";
import { connectDB } from "./lib/dbConfig.js";
import { MainRouter } from "./utils/routes";
import cookieParser from "cookie-parser";

const app = express();

// Middleware
app.use(
  cors({
    origin: [env.CLIENT_URI, env.ANGULAR_CLIENT_URI],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser())

// Routes
app.use("/api/v1",MainRouter);

// Start server AFTER DB connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      console.log(`${env.NODE_ENV} Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};
startServer();
