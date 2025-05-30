import express from "express";
import { createClass } from "../controllers/ClassController";
const router = express.Router();
router.post("/", createClass)