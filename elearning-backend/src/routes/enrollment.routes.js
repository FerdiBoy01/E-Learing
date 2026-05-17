const express = require("express");
const router = express.Router();

const enrollmentController = require("../controllers/enrollment.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

// ==========================================
// ROUTES UNTUK ENROLLMENT
// ==========================================

// 🔥 1. TAMBAHAN BARU: Mengambil daftar kelas milik siswa (GET /me)
// WAJIB ditaruh di atas /:courseId biar kata "me" nggak dianggap id kelas
router.get(
  "/me",
  protect,
  restrictTo("STUDENT"),
  enrollmentController.getMyEnrollments,
);

// 2. Mendaftar ke kelas (POST /:courseId)
router.post(
  "/:courseId",
  protect,
  restrictTo("STUDENT"),
  enrollmentController.enrollCourse,
);

module.exports = router;
