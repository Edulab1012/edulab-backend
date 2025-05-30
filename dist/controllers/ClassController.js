"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// export const createClass = async (req: Request, res: Response) => {
//     try {
//         const { name, teacherId } = req.body;
//         const promoCode = generatePromoCode();
//         const newClass = await prisma.class.create({
//             data: {
//                 name,
//                 teacherId,
//                 promoCode,
//             },
//         });
//         return res.status(201).json(newClass);
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Failed to create class" });
//     }
// };
//# sourceMappingURL=ClassController.js.map