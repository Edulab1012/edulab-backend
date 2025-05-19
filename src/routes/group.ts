import { Router } from "express";
import { allGroups, createGroup } from "../controllers/groupController";

const router = Router();

router.post("/group", createGroup); 
router.get("/group", allGroups )



export default router;