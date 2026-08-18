import { Router } from "express";
import { joinRoom } from "../controllers/joinRoom";
import { authenticateToken } from "../middleware/auth";
import { getMessages } from "../controllers/getMessage";
import { getUserProfile, updateUserProfile } from "../controllers/profile";
import { getUserRooms, getRoom, getRoomMembers } from "../controllers/rooms";

const userRouter: ReturnType<typeof Router> = Router();

userRouter.use(authenticateToken);

userRouter.post("/joinRoom", joinRoom);
userRouter.get("/rooms", getUserRooms);
userRouter.get("/room/:roomId", getRoom);
userRouter.get("/room/:roomId/members", getRoomMembers);
userRouter.get("/room/:roomId/messages", getMessages);
userRouter.get("/me", getUserProfile);
userRouter.patch("/me", updateUserProfile);

export default userRouter;
