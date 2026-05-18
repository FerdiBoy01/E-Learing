const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const submissionRepository = require("../repositories/submission.repository");
const AppError = require("../utils/AppError");

const submitChallenge = async (studentId, materialId, submissionData) => {
  // 1. Validasi apakah materi ini adalah tipe CHALLENGE
  const material = await prisma.material.findUnique({
    where: { id: materialId },
  });

  if (!material) throw new AppError("Materi tidak ditemukan", 404);
  if (material.type !== "CHALLENGE") {
    throw new AppError(
      "Anda hanya bisa melakukan submission pada materi bertipe CHALLENGE",
      400,
    );
  }

  // 2. Lakukan submission
  return await submissionRepository.createOrUpdateSubmission(
    studentId,
    materialId,
    submissionData,
  );
};

const getChallengeSubmissions = async (materialId) => {
  return await submissionRepository.getSubmissionsByMaterial(materialId);
};

const gradeSubmission = async (submissionId, gradeData) => {
  // Validasi apakah submission ada
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });
  if (!submission) throw new AppError("Submission tidak ditemukan", 404);

  return await submissionRepository.updateGrade(submissionId, gradeData);
};

module.exports = { submitChallenge, getChallengeSubmissions, gradeSubmission };
