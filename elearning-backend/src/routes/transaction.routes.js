const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const transactionController = require('../controllers/transaction.controller');
const transactionService = require('../services/transaction.service'); 
const { protect } = require('../middlewares/auth.middleware'); 

// --- KONFIGURASI UPLOAD BUKTI TRANSFER ---
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Hanya file gambar yang diizinkan!'), false);
  }
});

// ==========================================
// ENDPOINTS TRANSAKSI
// ==========================================

// 🔥 1. [STUDENT] Beli Kelas Pakai Poin (GAMIFICATION)
router.post('/pay-with-points', protect, transactionController.payWithPoints);

// 2. [STUDENT] Upload Bukti Transfer Manual
// Middleware kecil buat ngerakit URL gambar sebelum masuk ke Controller
router.post('/manual', protect, upload.single('receipt'), (req, res, next) => {
  if (req.file) {
    req.body.receipt_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  }
  next();
}, transactionController.manualPayment);

// 3. [LECTURER] Lihat Transaksi Pending
router.get('/pending', protect, async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const transactions = await transactionService.getPendingTransactions(lecturerId);
    
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

// 4. [LECTURER] ACC atau Tolak Pembayaran
router.put('/:id/validate', protect, async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { action } = req.body; // 'APPROVE' atau 'REJECT'
    const lecturerId = req.user.id;

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action tidak valid' });
    }

    const updatedTx = await transactionService.validateTransaction(transactionId, action, lecturerId);
    
    res.status(200).json({ success: true, message: `Transaksi berhasil di-${action}`, data: updatedTx });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

module.exports = router;