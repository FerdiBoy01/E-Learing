const express = require('express');
const progressController = require('../controllers/progress.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// Hanya MAHASISWA (STUDENT) yang bisa mengakses fitur progress ini
router.use(protect, restrictTo('STUDENT'));

// Endpoint untuk menandai materi selesai
router.post('/materials/:materialId/complete', progressController.completeMaterial);

// Endpoint untuk melihat seluruh materi yang sudah diselesaikan mahasiswa
router.get('/me', progressController.getMyProgress);

module.exports = router;