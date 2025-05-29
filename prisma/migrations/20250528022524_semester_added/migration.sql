/*
  Warnings:

  - You are about to drop the column `present` on the `Attendance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,teacherId,date,semesterId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `semesterId` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'late');

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "present",
ADD COLUMN     "semesterId" TEXT NOT NULL,
ADD COLUMN     "status" "AttendanceStatus" NOT NULL,
ADD COLUMN     "teacherId" TEXT NOT NULL,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TeachingClass" ADD COLUMN     "semesterId" TEXT;

-- CreateTable
CREATE TABLE "Semester" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_teacherId_date_semesterId_key" ON "Attendance"("studentId", "teacherId", "date", "semesterId");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingClass" ADD CONSTRAINT "TeachingClass_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;
