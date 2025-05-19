"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const groupController_1 = require("../controllers/groupController");
const router = (0, express_1.Router)();
router.post("/group", groupController_1.createGroup); // ✅
exports.default = router;
//# sourceMappingURL=group.js.map