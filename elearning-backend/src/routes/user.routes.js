const express = require("express");
const userController = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// 1. Rute Umum Pengguna Terproteksi Login
router.get("/me", protect, userController.getMyProfile);
router.put("/profile", protect, userController.updateProfile);

// 2. Middleware Khusus Superadmin
const restrictToAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ success: false, message: "Izin ditolak, khusus superadmin!" });
  }
  next();
};

// 3. Jalur Dewa (Root Control)
router.put(
  "/admin-mutate/:id",
  protect,
  restrictToAdmin,
  userController.updateUserRole,
);

// 🔥 FITUR BARU: Rute Hapus Data Permanen
router.delete(
  "/admin-mutate/:id",
  protect,
  restrictToAdmin,
  userController.deleteUser,
);

module.exports = router;
