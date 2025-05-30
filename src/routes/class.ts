import express from "express";
import { checkClass, createClass } from "../controllers/ClassController";

const router = express.Router();

router.post("/create", createClass)
router.post("/joinClass", checkClass);

export default router;