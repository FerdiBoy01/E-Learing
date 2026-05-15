const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const progressRepository = require('../repositories/progress.repository');
const AppError = require('../utils/AppError');

const completeMaterial = async (studentId, materialId) => {
  // 1. Validasi apakah materi tersebut ada di database
  const material = await prisma.material.findUnique({
    where: { id: materialId },
  });

  if (!material) {
    throw new AppError('Materi tidak ditemukan', 404);
  }

  // 2. Tandai sebagai selesai
  return await progressRepository.markAsCompleted(studentId, materialId);
};

const getMyProgress = async (studentId) => {
  return await progressRepository.getStudentProgress(studentId);
};

module.exports = { completeMaterial, getMyProgress };