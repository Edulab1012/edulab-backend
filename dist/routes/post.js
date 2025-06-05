"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = require("../controllers/postController");
const router = express_1.default.Router();
router.post("/", postController_1.createPost);
router.get("/class/:classId", postController_1.getPostsByClass);
router.get("/:postId", postController_1.getPostById);
router.post("/:postId/comments", postController_1.addComment);
router.get("/:postId/comments", postController_1.getCommentsByPost);
// Add these new routes
router.put("/comments/:commentId", postController_1.updateComment);
router.delete("/comments/:commentId", postController_1.deleteComment);
// Add to your post routes
router.get("/teacher/:teacherId", postController_1.getPostsByTeacher);
exports.default = router;
//# sourceMappingURL=post.js.map