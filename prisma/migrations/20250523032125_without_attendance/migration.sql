/*
  Warnings:

  - You are about to drop the column `activity` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `final` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `seasonId` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `totalScore` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the `Lesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Season` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `active` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exam` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Made the column `attendance` on table `Score` required. This step will fail if there are existing NULL values in that column.
  - Made the column `midterm` on table `Score` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_lessonId_fkey";

-- AlterTable
ALTER TABLE "Score" DROP COLUMN "activity",
DROP COLUMN "final",
DROP COLUMN "lessonId",
DROP COLUMN "seasonId",
DROP COLUMN "totalScore",
ADD COLUMN     "active" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "exam" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "attendance" SET NOT NULL,
ALTER COLUMN "midterm" SET NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "lessonId";

-- DropTable
DROP TABLE "Lesson";

-- DropTable
DROP TABLE "Season";
