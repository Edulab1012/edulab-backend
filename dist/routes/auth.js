"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//login (check user role)
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
//login (check user role)
router.post("/register", userController_1.createUser);
router.post("/login", userController_1.checkUser);
router.get("/users", userController_1.getAllUsers);
exports.default = router;
//# sourceMappingURL=auth.js.map