const express = require('express');
const contentController = require('../controllers/content.controller');
const validate = require('../middlewares/validate');
const { createChapterSchema, createMaterialSchema } = require('../validations/content.validation');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// 1. Wajib login dulu
router.use(protect);

// 2. Endpoint ini BEBAS diakses Mahasiswa maupun Dosen
router.get('/materials/:materialId', contentController.getMaterial);

// 3. Pembatas: Semua route di Bawah ini HANYA untuk DOSEN
router.use(restrictTo('LECTURER'));

// --- CREATE (TAMBAH) ---
router.post(
  '/courses/:courseId/chapters',
  validate(createChapterSchema),
  contentController.createChapter
);

router.post(
  '/chapters/:chapterId/materials',
  validate(createMaterialSchema),
  contentController.createMaterial
);

// --- UPDATE (EDIT) ---
// 👇 INI YANG BIKIN 404 TADI KARENA SALAH NARUH
router.put(
  '/chapters/:chapterId', 
  contentController.updateChapter
);

// --- DELETE (HAPUS) ---
router.delete(
  '/chapters/:chapterId', 
  contentController.deleteChapter
);

router.delete(
  '/materials/:materialId', 
  contentController.deleteMaterial
);

router.put(
  '/materials/:materialId', 
  contentController.updateMaterial
);

// PASTIKAN MODULE.EXPORTS ADA DI PALING BAWAH!!
module.exports = router;