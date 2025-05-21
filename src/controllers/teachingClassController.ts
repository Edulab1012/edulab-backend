import { Request, Response } from "express"
import prisma from "../prisma/client"
import jwt, { TokenExpiredError } from "jsonwebtoken"

// ✅ Create new class (with token check)
export const addTeachingClass = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            res.status(401).json({
                error: "❗ Token is missing. Please login and include: Bearer <token>",
            })
            return
        }

        const token = authHeader.split(" ")[1]
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as {
            userId: string
            role: string
            id: string
        }

        const teacherId = decodedToken.id


        if (!teacherId) {
            res.status(400).json({ error: "Teacher ID is required" })
            return
        }
        const { subject, schedule, term, gradeId, groupId } = req.body

        const newClass = await prisma.teachingClass.create({
            data: {
                subject,
                schedule,
                term,
                teacherId,
                gradeId,
                groupId,
            },
        })
        res.status(201).json({ message: "✅ Class created", teachingClass: newClass })
    } catch (error) {
        console.error("❌ Failed to create class:", error)
        res.status(500).json({ error: "Something went wrong" })
    }
}

// ✅ Get classes by teacher
export const getClassesByTeacher = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            res.status(401).json({
                error: "❗ Token байхгүй байна. Нэвтэрч орно уу.",
            })
            return
        }

        const token = authHeader.split(" ")[1]
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string }
        const teacherId = decodedToken.id

        const classes = await prisma.teachingClass.findMany({
            where: { teacherId },
            orderBy: { createdAt: "desc" },
            include: {
                grade: true, // 📦 Ангийн дугаар авчрах
                group: true, // 📦 Бүлгийн нэр авчрах
            }
        })

        const formatted = classes.map((cls) => ({
            id: cls.id,
            subject: cls.subject,
            schedule: cls.schedule,
            term: cls.term,
            createdAt: cls.createdAt,
            grade: cls.grade.number,  // ⬅️ зөвхөн дугаарыг илгээх
            group: cls.group.name     // ⬅️ зөвхөн нэрийг илгээх
        }))

        res.status(200).json(formatted)

    } catch (error: any) {
        if (error instanceof TokenExpiredError) {
            console.error("⛔ Token хугацаа дууссан")
            res.status(401).json({ error: "⏳ Token хугацаа дууссан байна. Дахин нэвтэрнэ үү." })
            return
        }

        console.error("❌ Ангийн мэдээлэл татахад алдаа:", error)
        res.status(500).json({ error: "Серверийн алдаа гарлаа" })
    }
}
// ✅ Delete class
export const deleteTeachingClass = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            res.status(401).json({ error: "❗ Token байхгүй байна. Нэвтэрч орно уу." })
            return
        }

        const token = authHeader.split(" ")[1]
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: string
        }

        const teacherId = decodedToken.id
        const { id } = req.params

        const teachingClass = await prisma.teachingClass.findUnique({ where: { id } })

        if (!teachingClass || teachingClass.teacherId !== teacherId) {
            res.status(403).json({ error: "⛔ Та зөвхөн өөрийнхөө ангиудыг устгах боломжтой" })
            return
        }

        await prisma.teachingClass.delete({ where: { id } })
        res.status(200).json({ message: "✅ Амжилттай устгалаа" })
    } catch (error) {
        console.error("❌ Устгах үед алдаа:", error)
        res.status(500).json({ error: "Анги устгах үед алдаа гарлаа" })
    }
}