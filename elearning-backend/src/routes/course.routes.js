const express = require('express');
const courseController = require('../controllers/course.controller');
const validate = require('../middlewares/validate');
const { createCourseSchema } = require('../validations/course.validation');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// Semua rute course di bawah ini wajib login
router.use(protect);

// ==========================================
// RUTE GLOBAL (Semua Role)
// ==========================================
// GET: Bisa diakses oleh STUDENT, LECTURER, CREATOR, ADMIN
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// ==========================================
// RUTE KHUSUS MAHASISWA (STUDENT)
// ==========================================
// (Route untuk enroll/masuk kelas sudah pindah ke enrollment.routes.js)
router.get('/:id/enroll-status', restrictTo('STUDENT'), courseController.checkEnrollmentStatus);
router.post('/:id/claim-reward', restrictTo('STUDENT'), courseController.claimReward);

// ==========================================
// RUTE KHUSUS PENGAJAR (LECTURER, CREATOR, ADMIN)
// ==========================================
// Pembatas: Rute di bawah ini HANYA untuk role yang bisa mengelola kelas
router.use(restrictTo('LECTURER', 'CREATOR', 'ADMIN'));

// POST: Membuat kelas baru
router.post(
  '/',
  validate(createCourseSchema), // Pastikan skema validasi lo udah update kalau ada kolom baru
  courseController.createCourse
);

// PUT: Update kelas (Edit Data, Harga, Visibility, Publish)
router.put('/:id', courseController.updateCourse);

// DELETE: Hapus kelas permanen
router.delete('/:id', courseController.deleteCourse);

module.exports = router;