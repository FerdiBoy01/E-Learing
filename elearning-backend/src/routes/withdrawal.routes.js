const express = require("express");
const router = express.Router();
const withdrawalController = require("../controllers/withdrawal.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

// Semua fungsi dompet wajib login dan hanya untuk dosen/kreator
router.use(protect);
router.use(restrictTo("LECTURER", "CREATOR", "ADMIN"));

// Endpoint Get Data Saldo
router.get("/me", withdrawalController.getMyWallet);

// Endpoint Ajukan Penarikan
router.post("/", withdrawalController.requestWithdrawal);

module.exports = router;
