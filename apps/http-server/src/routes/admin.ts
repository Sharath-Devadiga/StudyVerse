import { Router } from "express";
import { adminMiddleware } from "../middleware/admin";
import { adminSignin, adminSignup } from "../controllers/admin/createAdmin";
import { createUniversity } from "../controllers/admin/createUniversity";
import { addDepartments } from "../controllers/admin/createDepartments";
import { createSemesters } from "../controllers/admin/createSemesters";

const adminRouter: ReturnType<typeof Router> = Router();


adminRouter.post('/adminSignup',adminSignup);
adminRouter.post('/adminSignin',adminSignin);
adminRouter.post('/createUniversity',adminMiddleware,createUniversity);
adminRouter.post('/createDepartments',adminMiddleware,addDepartments);
adminRouter.post('/createSemesters',adminMiddleware,createSemesters);


export default adminRouter;

