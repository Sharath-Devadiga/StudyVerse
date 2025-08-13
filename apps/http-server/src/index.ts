import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import router from "./routes/auth.route";

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());

app.use("/auth", router);

app.listen(process.env.BACKEND_URL, () => {
  console.log(`Server running on port ${process.env.BACKEND_URL}`);
});
