import { Router } from "express";
import { getMe, getSocketToken, googleAuth, googleCallback, logout } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth";
import { signin, signup } from "../controllers/userAuth";

const router: ReturnType<typeof Router> = Router();

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

router.get("/me", authenticateToken, getMe);
router.get("/socket-token", authenticateToken, getSocketToken);
router.post("/logout", logout);

router.post("/signup", signup);
router.post("/signin", signin);


export default router;