"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ClassController_1 = require("../controllers/ClassController");
const router = express_1.default.Router();
router.post("/create", ClassController_1.createClass);
router.post("/joinClass", ClassController_1.checkClass);
router.get("/teacher/:teacherId", ClassController_1.getTeacherClasses);
router.get("/:classId/students", ClassController_1.getClassStudents);
router.delete("/:classId", ClassController_1.deleteClass);
exports.default = router;
//# sourceMappingURL=classes.js.map