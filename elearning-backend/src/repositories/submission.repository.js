const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createOrUpdateSubmission = async (studentId, materialId, submissionData) => {
  // Jika mahasiswa submit ulang sebelum dinilai, kita update URL-nya
  // Menggunakan findFirst karena kita tidak pakai compound unique di schema submission
  const existingSubmission = await prisma.submission.findFirst({
    where: { student_id: studentId, material_id: materialId },
  });

  if (existingSubmission) {
    return await prisma.submission.update({
      where: { id: existingSubmission.id },
      data: { ...submissionData, status: 'PENDING' },
    });
  }

  return await prisma.submission.create({
    data: {
      ...submissionData,
      student_id: studentId,
      material_id: materialId,
    },
  });
};

const getSubmissionsByMaterial = async (materialId) => {
  // Untuk dosen: melihat semua submission di suatu challenge
  return await prisma.submission.findMany({
    where: { material_id: materialId },
    include: {
      student: { select: { id: true, name: true, nim_nip: true } },
    },
    orderBy: { submitted_at: 'desc' },
  });
};

const updateGrade = async (submissionId, gradeData) => {
  return await prisma.submission.update({
    where: { id: submissionId },
    data: gradeData,
  });
};

module.exports = { createOrUpdateSubmission, getSubmissionsByMaterial, updateGrade };