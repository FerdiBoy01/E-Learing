const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const transactionController = require("../controllers/transaction.controller");
const transactionService = require("../services/transaction.service");
const { protect } = require("../middlewares/auth.middleware");

// --- KONFIGURASI FILE MULTIPART UPLOAD MANUAL ---
const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "receipt-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Hanya gambar yang diizinkan!"), false);
  },
});

// =========================================================================
// 🔒 WEBHOOK GATEWAY: EXEMPT FROM PROTECT MIDDLEWARE (OPEN PUBLIC ROAD)
// =========================================================================
// Rute ini WAJIB publik karena ditembak langsung dari server luar milik Midtrans
router.post(
  "/webhook",
  express.json(),
  transactionController.handleMidtransWebhook,
);

// =========================================================================
// PRIVATE STUDENT REGION (Wajib Melalui Autentikasi Login JWT)
// =========================================================================
router.use(protect);

// 🔥 Ambil Snap Token Pembayaran Kelas Premium
router.post(
  "/initiate-midtrans",
  transactionController.initiateMidtransPayment,
);

// Sistem Pembayaran Poin & Upload Bukti Transfer Manual
router.post("/pay-with-points", transactionController.payWithPoints);
router.post("/unlock-material", transactionController.unlockMaterialWithPoints);
router.post(
  "/manual",
  upload.single("receipt"),
  (req, res, next) => {
    if (req.file) {
      req.body.receipt_url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }
    next();
  },
  transactionController.manualPayment,
);

// =========================================================================
// PRIVILEGE LECTURER MANAGEMENT (Validasi Manual Kelas)
// =========================================================================
router.get("/pending", async (req, res) => {
  try {
    const transactions = await transactionService.getPendingTransactions(
      req.user.id,
    );
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
});

router.put("/:id/validate", async (req, res) => {
  try {
    if (!["APPROVE", "REJECT"].includes(req.body.action)) {
      return res
        .status(400)
        .json({ success: false, message: "Action tidak valid" });
    }
    const updatedTx = await transactionService.validateTransaction(
      req.params.id,
      req.body.action,
      req.user.id,
    );
    res
      .status(200)
      .json({
        success: true,
        message: `Transaksi berhasil di-${req.body.action}`,
        data: updatedTx,
      });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
});

module.exports = router;
