import { Router } from "express";
import { getMe, googleAuth, googleCallback, logout } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth";

const router: ReturnType<typeof Router> = Router();

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

router.get("/me", authenticateToken, getMe);
router.post("/logout", logout);



export default router;