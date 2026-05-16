const express = require('express');
const contentController = require('../controllers/content.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// Semua rute konten wajib login (Mahasiswa & Dosen boleh masuk gerbang awal)
router.use(protect);

// 🔥 Kita bikin variabel gembok khusus buat aksi "Edit/Tambah/Hapus"
const onlyInstructor = restrictTo('LECTURER', 'CREATOR', 'ADMIN');

// ==========================================
// URUSAN BAB (CHAPTER) - Cuma Instruktur yang boleh ngutak-ngatik
// ==========================================
router.post('/courses/:courseId/chapters', onlyInstructor, contentController.createChapter);
router.put('/chapters/:chapterId', onlyInstructor, contentController.updateChapter);
router.delete('/chapters/:chapterId', onlyInstructor, contentController.deleteChapter);

// ==========================================
// URUSAN MATERI (MATERIAL)
// ==========================================
router.post('/chapters/:chapterId/materials', onlyInstructor, contentController.createMaterial);

// ✅ NAH INI DIA KUNCINYA: GET Material DIBUKA buat semua yang udah login (termasuk Student)
router.get('/materials/:materialId', contentController.getMaterial);

router.put('/materials/:materialId', onlyInstructor, contentController.updateMaterial);
router.delete('/materials/:materialId', onlyInstructor, contentController.deleteMaterial);

module.exports = router;