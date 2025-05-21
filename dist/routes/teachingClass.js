"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teachingClassController_1 = require("../controllers/teachingClassController");
const router = express_1.default.Router();
router.post("/", teachingClassController_1.addTeachingClass);
router.get("/:teacherId", teachingClassController_1.getClassesByTeacher);
router.delete("/:id", teachingClassController_1.deleteTeachingClass);
exports.default = router;
//# sourceMappingURL=teachingClass.js.map