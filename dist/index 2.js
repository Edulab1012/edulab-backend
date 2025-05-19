"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const teacher_1 = __importDefault(require("./routes/teacher"));
const group_1 = __importDefault(require("./routes/group"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/auth", auth_1.default);
app.use("/api/v1/teacher", teacher_1.default);
app.use("/api/v1", group_1.default);
;
app.get("/", (req, res) => {
    try {
        res.send("✅ Server running...");
    }
    catch (error) {
        console.error("Error in root route:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server listening at: http://localhost:${PORT}`);
});
