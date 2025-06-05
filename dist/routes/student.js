"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studentController_1 = require("../controllers/studentController");
const router = express_1.default.Router();
router.get("/:studentId", studentController_1.getStudent);
router.put("/:studentId/avatar", studentController_1.updateStudentAvatar);
exports.default = router;
//# sourceMappingURL=student.js.map