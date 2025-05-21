-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "gender" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TeachingClass" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "schedule" JSONB NOT NULL,
    "term" TEXT,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeachingClass_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TeachingClass" ADD CONSTRAINT "TeachingClass_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
