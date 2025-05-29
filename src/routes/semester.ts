import { Router } from "express";
import {
  createSemester,
  getSemesters,
  setCurrentSemester,
} from "../controllers/semesterContoller";

const router = Router();
router
  .post("/", createSemester)
  .get("/", getSemesters)
  .patch("/:id/set-current", setCurrentSemester);

export default router;
