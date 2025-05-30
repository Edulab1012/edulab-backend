"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studentController_1 = require("../controllers/studentController");
const router = express_1.default.Router();
router
    .post("/", studentController_1.addStudent)
    .get("/", studentController_1.getAllStudents)
    .get("/withStudents", studentController_1.getStudentsByTeacher); // 🧩 Энэ функц нь зөвхөн сурагчийн мэдээлэл төдийгүй,
// багш, бүлэг, анги зэрэг бүх холбоотой мэдээллийг хамтад нь өгдөг.
exports.default = router;
//# sourceMappingURL=student.js.map