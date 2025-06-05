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
// import teacherRoutes from "./routes/teacher";
const student_1 = __importDefault(require("./routes/student"));
const class_1 = __importDefault(require("./routes/class"));
const supabase_js_1 = require("@supabase/supabase-js");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_KEY || 'your-supabase-key';
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use("/api/v1/auth", auth_1.default);
// app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/student", student_1.default);
app.use("/api/v1/posts", post_1.default);
app.use("/api/v1/class", class_1.default);
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