import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import router from "./routes/auth.route";
import cors from "cors";
import adminRouter from "./routes/admin";
import userRouter from "./routes/user";
import dataRouter from "./routes/data";
import { prisma } from "@repo/db/prisma";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.use(cookieParser());
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "error", error: "Database unavailable" });
  }
});

app.use("/auth", router);
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/api", dataRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
