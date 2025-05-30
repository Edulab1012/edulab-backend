"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClass = void 0;
const client_1 = require("@prisma/client");
const PromoCodeGenerator_1 = require("../utils/PromoCodeGenerator");
const prisma = new client_1.PrismaClient();
const createClass = async (req, res) => {
    try {
        const { name, teacherId, promoCode } = req.body;
        if (!name || !teacherId) {
            return res.status(400).json({ message: "Анги нэр болон багшийн ID заавал шаардлагатай." });
        }
        // ✅ Багшийн ID үнэхээр `Teacher` хүснэгтэд байгаа эсэхийг шалгана
        const teacherExists = await prisma.teacher.findUnique({
            where: { id: teacherId },
        });
        if (!teacherExists) {
            return res.status(400).json({ message: "Ийм ID-тай багш олдсонгүй." });
        }
        // ✅ Промо код ашиглах буюу шинээр үүсгэх
        const finalPromoCode = promoCode || (0, PromoCodeGenerator_1.generatePromoCode)(name);
        const newClass = await prisma.class.create({
            data: {
                name,
                teacherId,
                promoCode: finalPromoCode,
            },
        });
        return res.status(201).json(newClass);
    }
    catch (error) {
        console.error("❌ Error while creating class:", error);
        if (error.code === "P2002" && error.meta?.target?.includes("promoCode")) {
            return res.status(409).json({ message: "Промо код давхцаж байна. Өөр код оруулна уу." });
        }
        return res.status(500).json({ message: "Анги үүсгэхэд алдаа гарлаа." });
    }
};
exports.createClass = createClass;
//# sourceMappingURL=ClassController.js.map