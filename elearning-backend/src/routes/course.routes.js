const express = require("express");
const courseController = require("../controllers/course.controller");
const validate = require("../middlewares/validate");
const { createCourseSchema = {} } = require("../validations/course.validation");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

const router = express.Router();

// Semua rute di bawah ini wajib melintasi satpam login
router.use(protect);

// ==========================================
// 🔥 GLOBAL NOTIFICATION SYSTEMS (Semua Role Bisa Akses)
// ==========================================
// Wajib ditaruh di paling atas agar tidak tabrakan dengan rute dinamis /:id
router.get("/notifications/me", courseController.getMyNotifications);
router.patch("/notifications/:id/read", courseController.readNotification);

// ==========================================
// RUTE MANAGEMENT INTERNAL PENGURUS/PENGAJAR
// ==========================================
router.get(
  "/lecturer/me",
  restrictTo("LECTURER", "CREATOR", "ADMIN"),
  courseController.getLecturerCourses,
);

// ==========================================
// RUTE KHUSUS MAHASISWA (STUDENT)
// ==========================================
router.get(
  "/unlocked-materials/me",
  restrictTo("STUDENT"),
  courseController.getMyUnlockedMaterials,
);

// ==========================================
// RUTE KATALOG GLOBAL (Bisa Diakses Semua Pengguna)
// ==========================================
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);

// ==========================================
// LANJUTAN KENDALI MAHASISWA (STUDENT ENGINE)
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
// AKSI MODERASI & MODUL (LECTURER, CREATOR, ADMIN)
// ==========================================
router.use(restrictTo("LECTURER", "CREATOR", "ADMIN"));
router.post("/", validate(createCourseSchema), courseController.createCourse);
router.put("/:id", courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);

module.exports = router;
