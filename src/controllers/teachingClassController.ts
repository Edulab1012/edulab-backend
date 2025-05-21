import { Request, Response } from "express"
import prisma from "../prisma/client"
import jwt from "jsonwebtoken"

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
        const { subject, grade, group, schedule, term } = req.body

        const newClass = await prisma.teachingClass.create({
            data: {
                subject,    // array if subject is String[]
                grade,
                group,      // must be added to schema
                schedule,
                term,
                teacherId,
            }
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
        const { teacherId } = req.params

        const classes = await prisma.teachingClass.findMany({
            where: { teacherId },
            orderBy: { createdAt: "desc" },
        })

        res.status(200).json(classes)
    } catch (error) {
        console.error("❌ Failed to get classes:", error)
        res.status(500).json({ error: "Failed to load classes" })
    }
}

// ✅ Delete class
export const deleteTeachingClass = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        await prisma.teachingClass.delete({ where: { id } })
        res.status(200).json({ message: "✅ Class deleted" })
    } catch (error) {
        console.error("❌ Failed to delete class:", error)
        res.status(500).json({ error: "Failed to delete class" })
    }
}