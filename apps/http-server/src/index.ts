import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import router from "./routes/auth.route";

import cors from "cors"; 
import adminRouter from "./routes/admin";
import userRouter from "./routes/user";
import dataRouter from "./routes/data";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(cookieParser());
app.use(express.json());

app.use("/auth", router);
app.use('/admin',adminRouter)
app.use('/user',userRouter)
app.use('/api', dataRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
