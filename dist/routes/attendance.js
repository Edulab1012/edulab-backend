"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendanceController_1 = require("../controllers/attendanceController");
const router = (0, express_1.Router)();
router.post("/submit", attendanceController_1.submitAttendance);
router.get("/today", attendanceController_1.getTodaysAttendance);
router.get("/summary", attendanceController_1.getAttendanceSummary);
router.get("/class/:classId/today", attendanceController_1.getClassTodaysAttendance);
exports.default = router;
//# sourceMappingURL=attendance.js.map