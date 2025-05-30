import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createClass = async (req: Request, res: Response) => {
    try {
        const { name, teacherId } = req.body;

        const promoCode = generatePromoCode();

        const newClass = await prisma.class.create({
            data: {
                name,
                teacherId,
                promoCode,
            },
        });

        res.status(201).json(newClass);
        return
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create class" });
        return
    }
};