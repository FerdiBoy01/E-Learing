const submissionService = require('../services/submission.service');
const { sendSuccess } = require('../utils/responseHandler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const submitChallenge = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const studentId = req.user.id;

    const submission = await submissionService.submitChallenge(studentId, materialId, req.body);
    return sendSuccess(res, 201, 'Tugas berhasil dikumpulkan', { submission });
  } catch (error) {
    next(error);
  }
};

const getChallengeSubmissions = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const submissions = await submissionService.getChallengeSubmissions(materialId);
    return sendSuccess(res, 200, 'Data pengumpulan tugas berhasil diambil', { submissions });
  } catch (error) {
    next(error);
  }
};

// 1. FUNGSI DOSEN MELIHAT TUGAS MASUK
const getLecturerSubmissions = async (req, res, next) => {
  try {
    const lecturerId = req.user.id;
    
    const submissions = await prisma.submission.findMany({
      where: {
        material: {
          chapter: {
            course: {
              lecturer_id: lecturerId
            }
          }
        }
      },
      include: {
        student: { select: { name: true } },
        material: { select: { title: true } }
      },
      orderBy: { submitted_at: 'desc' } 
    });

    return sendSuccess(res, 200, 'Data penilaian berhasil diambil', { submissions });
  } catch (error) {
    next(error);
  }
};

// 2. FUNGSI DOSEN MEMBERI NILAI (Menggunakan Prisma Langsung)
const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body; 

    const gradedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: parseInt(score), 
        feedback: feedback || null, 
        status: 'GRADED' 
      }
    });

    return sendSuccess(res, 200, 'Tugas berhasil dinilai', { submission: gradedSubmission });
  } catch (error) {
    console.error("Error saat nyimpen nilai:", error);
    next(error);
  }
};

// 3. FUNGSI MAHASISWA MELIHAT RAPORT (Tadi nggak sengaja kehapus)
const getStudentSubmissions = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const submissions = await prisma.submission.findMany({
      where: { student_id: studentId },
      include: {
        material: { select: { title: true, type: true } }
      },
      orderBy: { submitted_at: 'desc' }
    });
    return sendSuccess(res, 200, 'Riwayat tugas berhasil diambil', { submissions });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  submitChallenge, 
  getChallengeSubmissions, 
  getLecturerSubmissions, 
  gradeSubmission,
  getStudentSubmissions
};