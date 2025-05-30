import { PrismaClient } from "@prisma/client";
import { generatePromoCode } from "../utils/PromoCodeGenerator";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const createClass = async (req: Request, res: Response) => {
    try {
        const { name, userId, promoCode } = req.body;

        if (!name || !userId) {
            res.status(400).json({ message: "Анги нэр болон хэрэглэгчийн ID шаардлагатай." });
            return;
        }

        // 🔍 Хэрэглэгчийн ID-аас багшийн ID-г олно
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { teacher: true },
        });

        if (!user || !user.teacher) {
            res.status(400).json({ message: "Багш олдсонгүй." });
            return;
        }

        const finalPromoCode = promoCode || generatePromoCode(name);

        const newClass = await prisma.class.create({
            data: {
                name,
                teacherId: user.teacher.id, 
                promoCode: finalPromoCode,
            },
        });

        res.status(201).json(newClass);
        return;
    } catch (error: any) {
        console.error("❌ Error while creating class:", error);

        if (error.code === "P2002" && error.meta?.target?.includes("promoCode")) {
            res.status(409).json({ message: "Промо код давхцаж байна." });
            return;
        }

        res.status(500).json({ message: "Анги үүсгэхэд алдаа гарлаа." });
        return;
    }
};