import express from "express";
import {
  createPost,
  getPostsByClass,
  getPostById,
  addComment,
  getCommentsByPost,
} from "../controllers/postController";

const router = express.Router();

router.post("/", createPost);
router.get("/class/:classId", getPostsByClass);
router.get("/:postId", getPostById);
router.post("/:postId/comments", addComment);
router.get("/:postId/comments", getCommentsByPost);

export default router;