const express = require('express');
const submissionController = require('../controllers/submission.controller');
const validate = require('../middlewares/validate');
// 👇 Hapus import gradeSubmissionSchema karena bikin error undefined
const { submitChallengeSchema } = require('../validations/submission.validation'); 
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect); // Semua wajib login

// --------------------------------------------------------
// ROUTE DOSEN: Melihat Semua Tugas yg Masuk
// --------------------------------------------------------
router.get(
  '/lecturer',
  restrictTo('LECTURER'),
  submissionController.getLecturerSubmissions
);

// --------------------------------------------------------
// ROUTE MAHASISWA: Melihat Nilai Raport Sendiri
// --------------------------------------------------------
router.get(
  '/student',
  restrictTo('STUDENT'),
  submissionController.getStudentSubmissions
);

// --------------------------------------------------------
// ROUTE MAHASISWA: Mengumpulkan Tugas Baru
// --------------------------------------------------------
router.post(
  '/materials/:materialId',
  restrictTo('STUDENT'),
  validate(submitChallengeSchema), // 🔥 NYALAKAN KEMBALI COY!
  submissionController.submitChallenge
);
// --------------------------------------------------------
// ROUTE DOSEN: Melihat Spesifik Materi
// --------------------------------------------------------
router.get(
  '/materials/:materialId',
  restrictTo('LECTURER'),
  submissionController.getChallengeSubmissions
);

// --------------------------------------------------------
// ROUTE DOSEN: Memberi Nilai
// 👇 PERBAIKAN: Middleware validate(...) dihapus!
// --------------------------------------------------------
router.put(
  '/:submissionId/grade',
  restrictTo('LECTURER'),
  submissionController.gradeSubmission
);

module.exports = router;