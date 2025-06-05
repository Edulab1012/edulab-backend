"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const post_1 = __importDefault(require("./routes/post"));
const auth_1 = __importDefault(require("./routes/auth"));
const attendance_1 = __importDefault(require("./routes/attendance"));
// import teacherRoutes from "./routes/teacher";
const student_1 = __importDefault(require("./routes/student"));
const classes_1 = __importDefault(require("./routes/classes"));
const supabase_js_1 = require("@supabase/supabase-js");
// import semesterRoutes from "./routes/semester";
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const supabaseUrl = process.env.SUPABASE_URL || "https://iuuliuoqgudrqrjfdsuo.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dWxpdW9xZ3VkcnFyamZkc3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzczODIsImV4cCI6MjA2MzYxMzM4Mn0.Sw85JlpgRLP8P_dXBn9Fa5rnnjHez62v85U5v1ps9KA";
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "https://edulab-frontend-kappa.vercel.app/"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use("/api/v1/attendance", attendance_1.default);
app.use("/api/v1/auth", auth_1.default);
// app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/student", student_1.default);
app.use("/api/v1/posts", post_1.default);
app.use("/api/v1/class", classes_1.default);
// app.use("/api/v1/semester", semesterRoutes);
app.get("/", (req, res) => {
    try {
        res.send("✅ Server running...");
    }
    catch (error) {
        console.log("Error in root route:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server listening at: http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map