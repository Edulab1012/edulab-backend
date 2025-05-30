"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacherController_1 = require("../controllers/teacherController");
const router = (0, express_1.Router)();
router
    .post("/", teacherController_1.addTeacher)
    // .get("/withStudents", getStudentsWithAttendance)
    .post("/attendance", teacherController_1.submitAttendance);
// .get("/attendance/today", getTodaysAttendance);
exports.default = router;
//# sourceMappingURL=teacher.js.map