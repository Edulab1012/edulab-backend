// File: scripts/createFakeTeacher.ts (or anywhere in your project)
import prisma from "../prisma/client";

async function createFakeTeacher() {
  try {
    // 1. Create or find the school
    const school = await prisma.school.upsert({
      where: { email: "testschool@example.com" },
      update: {},
      create: {
        name: "Test School",
        email: "testschool@example.com",
      },
    });

    // 2. Create a grade in that school
    const grade = await prisma.grade.create({
      data: {
        number: 1,
        schoolId: school.id,
      },
    });

    // 3. Create a group in that grade
    const group = await prisma.group.create({
      data: {
        name: "Group A",
        gradeId: grade.id,
      },
    });

    // 4. Create or update a fake teacher with relations to grade and group
    const teacher = await prisma.teacher.upsert({
      where: { email: "faketeacher@example.com" },
      update: {
        gradeId: grade.id,
        groupId: group.id,
        phoneNumber: "88997766",
        emergencyNumber: "99887766",
      },
      create: {
        firstName: "Fake",
        lastName: "Teacher",
        email: "faketeacher@example.com",
        password: "securepassword123",
        phoneNumber: "88997766",
        emergencyNumber: "99887766",
        gradeId: grade.id,
        groupId: group.id,
      },
    });

    console.log("✅ Fake teacher created successfully:");
    console.log("School:", school.name);
    console.log("Grade:", grade.number);
    console.log("Group:", group.name);
    console.log("Teacher:", `${teacher.firstName} ${teacher.lastName}`);
  } catch (error) {
    console.error("❌ Failed to create fake teacher:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createFakeTeacher();
