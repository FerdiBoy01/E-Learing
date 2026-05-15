const express = require('express');
const courseController = require('../controllers/course.controller');
const validate = require('../middlewares/validate');
const { createCourseSchema } = require('../validations/course.validation');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// Semua rute course di bawah ini wajib login
router.use(protect);

// GET: Bisa diakses oleh Mahasiswa (STUDENT) dan Dosen (LECTURER)
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
// Taruh di bawah router.get('/:id', ...)
router.get('/:id/enroll-status', restrictTo('STUDENT'), courseController.checkEnrollmentStatus);
router.post('/:id/enroll', restrictTo('STUDENT'), courseController.enrollCourse);
router.post('/:id/claim-reward', restrictTo('STUDENT'), courseController.claimReward);

// ----------------------------------------------------
// PEMBATAS: Rute di bawah ini HANYA untuk Dosen
// ----------------------------------------------------
router.use(restrictTo('LECTURER'));

// POST: Membuat kelas baru
router.post(
  '/',
  validate(createCourseSchema),
  courseController.createCourse
);

// PUT: Update kelas (Edit Data & Aktif/Nonaktif)
router.put('/:id', courseController.updateCourse);

// DELETE: Hapus kelas permanen
router.delete('/:id', courseController.deleteCourse);



module.exports = router;