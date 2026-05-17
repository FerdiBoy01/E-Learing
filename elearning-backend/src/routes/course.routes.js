const express = require("express");
const courseController = require("../controllers/course.controller");
const validate = require("../middlewares/validate");
const { createCourseSchema } = require("../validations/course.validation");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

// ==========================================
// RUTE KHUSUS MAHASISWA (STUDENT) - Taruh di ATAS /:id
// ==========================================
// 🔥 Rute ini HARUS di atas /:id biar kata "unlocked-materials" ga dikira ID kelas
router.get(
  "/unlocked-materials/me",
  restrictTo("STUDENT"),
  courseController.getMyUnlockedMaterials,
);

// ==========================================
// RUTE GLOBAL (Semua Role)
// ==========================================
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);

// ==========================================
// LANJUTAN RUTE MAHASISWA
// ==========================================
router.get(
  "/:id/enroll-status",
  restrictTo("STUDENT"),
  courseController.checkEnrollmentStatus,
);
router.post(
  "/:id/claim-reward",
  restrictTo("STUDENT"),
  courseController.claimReward,
);

// ==========================================
// RUTE KHUSUS PENGAJAR (LECTURER, CREATOR, ADMIN)
// ==========================================
router.use(restrictTo("LECTURER", "CREATOR", "ADMIN"));
router.post("/", validate(createCourseSchema), courseController.createCourse);
router.put("/:id", courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);

module.exports = router;
