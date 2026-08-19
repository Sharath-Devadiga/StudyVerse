import { Router } from "express";
import { adminMiddleware } from "../middleware/admin";
import { adminSignin, adminSignup } from "../controllers/admin/createAdmin";
import { createUniversity } from "../controllers/admin/createUniversity";
import { addDepartments } from "../controllers/admin/createDepartments";
import { createSemesters } from "../controllers/admin/createSemesters";
import * as management from "../controllers/admin/management";

const adminRouter: ReturnType<typeof Router> = Router();


adminRouter.post('/adminSignup',adminSignup);
adminRouter.post('/adminSignin',adminSignin);
adminRouter.get('/me', adminMiddleware, management.adminMe);
adminRouter.get('/stats', adminMiddleware, management.stats);
adminRouter.get('/universities', adminMiddleware, management.listUniversities);
adminRouter.post('/universities', adminMiddleware, management.createUniversityAdmin);
adminRouter.patch('/universities/:id', adminMiddleware, management.updateUniversity);
adminRouter.get('/departments', adminMiddleware, management.listDepartments);
adminRouter.post('/departments', adminMiddleware, management.createDepartment);
adminRouter.patch('/departments/:id', adminMiddleware, management.updateDepartment);
adminRouter.get('/semesters', adminMiddleware, management.listSemesters);
adminRouter.post('/semesters', adminMiddleware, management.createSemester);
adminRouter.patch('/semesters/:id', adminMiddleware, management.updateSemester);
adminRouter.get('/channels', adminMiddleware, management.listChannelsAdmin);
adminRouter.post('/channels', adminMiddleware, management.createChannel);
adminRouter.patch('/channels/:id', adminMiddleware, management.updateChannel);
adminRouter.delete('/channels/:id', adminMiddleware, management.deleteChannel);
adminRouter.get('/users', adminMiddleware, management.listUsers);
adminRouter.patch('/users/:id', adminMiddleware, management.updateUserStatus);
adminRouter.delete('/messages/:id', adminMiddleware, management.deleteMessage);
adminRouter.delete('/resources/:id', adminMiddleware, management.deleteResource);
adminRouter.post('/createUniversity',adminMiddleware,createUniversity);
adminRouter.post('/createDepartments',adminMiddleware,addDepartments);
adminRouter.post('/createSemesters',adminMiddleware,createSemesters);


export default adminRouter;

