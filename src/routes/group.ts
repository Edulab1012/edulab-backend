import { Router } from "express";
import {
  allGroupsByTeacher,
  createGroup,
  allGroups,
} from "../controllers/groupController";

const router = Router();

router.post("/group", createGroup);
router.get("/group", allGroupsByTeacher);
router.get("/allgroup", allGroups);

export default router;
