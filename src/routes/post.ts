import express from "express";
import {
  createPost,
  getPostsByClass,
  getPostById,
  addComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
  getPostsByTeacher,
} from "../controllers/postController";

const router = express.Router();

router.post("/", createPost);
router.get("/class/:classId", getPostsByClass);
router.get("/:postId", getPostById);
router.post("/:postId/comments", addComment);
router.get("/:postId/comments", getCommentsByPost);
// Add these new routes
router.put("/comments/:commentId", updateComment);
router.delete("/comments/:commentId", deleteComment);
// Add to your post routes
router.get("/teacher/:teacherId", getPostsByTeacher);
export default router;
