const express = require("express");
const adminController = require("../controllers/admin.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

const router = express.Router();

// 🔥 PROTEKSI GANDA: Wajib Login & Wajib ADMIN
router.use(protect);
router.use(restrictTo("ADMIN"));

// ==========================================
// ENDPOINTS ADMIN
// ==========================================
router.get("/stats", adminController.getDashboardStats);
router.get("/users", adminController.getAllUsers);
router.put("/users/:id/role", adminController.updateUserRole);
router.get("/transactions", adminController.getAllTransactions);
router.post("/users", adminController.createUser);
router.get("/courses/:id/review", adminController.getCourseDetailForReview);
router.put("/courses/:id/approve", adminController.approveCourse);

module.exports = router;
