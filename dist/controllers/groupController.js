"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGroup = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const createGroup = async (req, res) => {
    try {
        const { grade, group } = req.body;
        if (!grade || !group) {
            res.status(400).json({ error: "Анги болон бүлэг заавал хэрэгтэй!" });
            return;
        }
        // Step 1: Check or create Grade
        const gradeNumber = parseInt(grade);
        let existingGrade = await client_1.default.grade.findUnique({
            where: { number: gradeNumber },
        });
        if (!existingGrade) {
            existingGrade = await client_1.default.grade.create({
                data: { number: gradeNumber },
            });
        }
        // Step 2: Check if group already 
        const existingGroup = await client_1.default.group.findFirst({
            where: {
                name: group.toUpperCase(),
                gradeId: existingGrade.id,
            },
        });
        if (existingGroup) {
            res.status(409).json({ error: "Ийм анги, бүлэг аль хэдийн үүссэн байна." });
            return;
        }
        // Step 3: Create Group
        const newGroup = await client_1.default.group.create({
            data: {
                name: group.toUpperCase(),
                gradeId: existingGrade.id,
            },
        });
        res.status(201).json({
            message: "Анги, бүлэг амжилттай үүсгэгдлээ 🎉",
            group: newGroup,
        });
        return;
    }
    catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({
            error: "Серверийн алдаа.",
            details: error.message,
        });
    }
};
exports.createGroup = createGroup;
//# sourceMappingURL=groupController.js.map