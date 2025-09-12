import { Router } from "express";
import { getUniversities } from "../controllers/data/getUniversities";
import { getDepartments } from "../controllers/data/getDepartments";
import { getSemesters } from "../controllers/data/getSemesters";

const dataRouter: ReturnType<typeof Router> = Router();

// Public routes for fetching data for the selection UI
dataRouter.get('/universities', getUniversities);
dataRouter.get('/universities/:universityId/departments', getDepartments);
dataRouter.get('/departments/:departmentId/semesters', getSemesters);

export default dataRouter;
