const express = require('express');
const router = express.Router();

// Import controller
const enrollmentController = require('../controllers/enrollment.controller'); 

// 🔥 INI PENYEBAB ERRORNYA KEMAREN COY (Harus auth.middleware)
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// ==========================================
// ROUTES UNTUK ENROLLMENT
// ==========================================

// Endpoint: POST /api/enrollments/:courseId
router.post(
  '/:courseId',
  protect,
  restrictTo('STUDENT'),
  enrollmentController.enrollCourse
);

module.exports = router;