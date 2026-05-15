const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect); // Wajib login

// Endpoint khusus Dashboard Dosen
router.get(
  '/lecturer',
  restrictTo('LECTURER'),
  dashboardController.getLecturerDashboard
);

// Endpoint khusus Dashboard Mahasiswa
router.get(
  '/student',
  restrictTo('STUDENT'),
  dashboardController.getStudentDashboard
);

module.exports = router;