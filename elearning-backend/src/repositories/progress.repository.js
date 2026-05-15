const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const markAsCompleted = async (studentId, materialId) => {
  return await prisma.studentProgress.upsert({
    where: {
      // Sesuai dengan @@unique([student_id, material_id]) di schema.prisma
      student_id_material_id: {
        student_id: studentId,
        material_id: materialId,
      },
    },
    update: {
      is_completed: true,
      completed_at: new Date(),
    },
    create: {
      student_id: studentId,
      material_id: materialId,
      is_completed: true,
      completed_at: new Date(),
    },
  });
};

const getStudentProgress = async (studentId) => {
  return await prisma.studentProgress.findMany({
    where: { student_id: studentId, is_completed: true },
    include: {
      material: {
        select: { id: true, title: true, chapter_id: true },
      },
    },
  });
};

module.exports = { markAsCompleted, getStudentProgress };