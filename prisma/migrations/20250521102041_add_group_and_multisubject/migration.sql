/*
  Warnings:

  - The `subject` column on the `TeachingClass` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TeachingClass" ADD COLUMN     "group" TEXT,
DROP COLUMN "subject",
ADD COLUMN     "subject" TEXT[];
