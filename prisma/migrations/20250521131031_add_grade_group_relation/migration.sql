/*
  Warnings:

  - You are about to drop the column `grade` on the `TeachingClass` table. All the data in the column will be lost.
  - You are about to drop the column `group` on the `TeachingClass` table. All the data in the column will be lost.
  - Added the required column `gradeId` to the `TeachingClass` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupId` to the `TeachingClass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TeachingClass" DROP COLUMN "grade",
DROP COLUMN "group",
ADD COLUMN     "gradeId" TEXT NOT NULL,
ADD COLUMN     "groupId" TEXT NOT NULL,
ALTER COLUMN "schedule" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TeachingClass" ADD CONSTRAINT "TeachingClass_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingClass" ADD CONSTRAINT "TeachingClass_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
