const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const AppError = require("../utils/AppError");

// =========================================================================
// 1. FUNGSI UNTUK MAHASISWA: Kirim Bukti Transfer
// =========================================================================
const submitManualPayment = async (studentId, courseId, receiptUrl) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError("Mata kuliah tidak ditemukan", 404);
  if (course.type !== "PROJECT_BASED")
    throw new AppError("Kelas ini gratis, silakan langsung ambil", 400);

  // Cek apakah mahasiswa sudah punya transaksi yang masih PENDING
  const existingPending = await prisma.transaction.findFirst({
    where: { student_id: studentId, course_id: courseId, status: "PENDING" },
  });
  if (existingPending)
    throw new AppError(
      "Anda sudah mengirimkan bukti. Menunggu validasi dosen.",
      400,
    );

  // 🔥 KALKULASI REVENUE SHARE (20% Admin, 80% Dosen)
  const platformFee = Math.floor(course.price * 0.2);
  const netRevenue = course.price - platformFee;
  const orderId = `MANUAL-${Date.now()}-${studentId.slice(0, 5)}`;

  const transaction = await prisma.transaction.create({
    data: {
      id: orderId,
      student_id: studentId,
      course_id: courseId,
      amount: course.price,
      platform_fee: platformFee,
      net_revenue: netRevenue,
      status: "PENDING",
      payment_url: receiptUrl,
      gateway_reference: "MANUAL_TRANSFER",
    },
  });

  return transaction;
};

// =========================================================================
// 2. FUNGSI UNTUK DOSEN: Ambil Daftar Transaksi yang Belum di-ACC
// =========================================================================
const getPendingTransactions = async (lecturerId) => {
  return await prisma.transaction.findMany({
    where: {
      status: "PENDING",
      course: { lecturer_id: lecturerId },
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true, price: true } },
    },
    orderBy: { created_at: "asc" },
  });
};

// =========================================================================
// 3. 🔒 FUNGSI UNTUK DOSEN: ACC atau TOLAK Pembayaran (SECURE TRANSACTION)
// =========================================================================
const validateTransaction = async (transactionId, action, lecturerId) => {
  // 1. Ambil data awal buat verifikasi keamanan otorisasi
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { course: true },
  });

  if (!transaction) throw new AppError("Transaksi tidak ditemukan", 404);
  if (transaction.course.lecturer_id !== lecturerId)
    throw new AppError("Akses ditolak, ini bukan kelas Anda!", 403);
  if (transaction.status !== "PENDING")
    throw new AppError("Transaksi ini sudah diproses", 400);

  // ==========================================
  // JIKA DOSEN MENOLAK (REJECT)
  // ==========================================
  if (action === "REJECT") {
    return await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "FAILED" },
      }),
      prisma.notification.create({
        data: {
          user_id: transaction.student_id,
          title: "❌ Pembayaran Ditolak",
          message: `Maaf, bukti transfer untuk kelas "${transaction.course.title}" ditolak oleh Dosen. Pastikan bukti valid dan coba lagi.`,
        },
      }),
    ]);
  }

  // ==========================================
  // JIKA DOSEN MENG-ACC (APPROVE) - INTERACTIVE TRANSACTION MURNI
  // ==========================================
  if (action === "APPROVE") {
    // 🔥 Kita bungkus di dalam tx (Interactive Transaction) agar anti-Double-Click / Race Condition
    const result = await prisma.$transaction(async (tx) => {
      // 1. Double check: Pastikan di detik ini statusnya BENAR-BENAR MASIH PENDING
      const checkTx = await tx.transaction.findUnique({
        where: { id: transactionId },
      });
      if (checkTx.status !== "PENDING") {
        throw new AppError(
          "Terjadi tabrakan data, transaksi ini baru saja diproses!",
          400,
        );
      }

      // 2. Ubah status jadi SUCCESS
      const updatedTx = await tx.transaction.update({
        where: { id: transactionId },
        data: { status: "SUCCESS" },
      });

      // 3. Masukkan mahasiswa ke kelas (Enrollment)
      await tx.enrollment.create({
        data: {
          student_id: transaction.student_id,
          course_id: transaction.course_id,
          enrolled_at: new Date(),
        },
      });

      // 4. 🔥 SUNTIK PENDAPATAN KE DOSEN (Net Revenue 80%)
      await tx.user.update({
        where: { id: lecturerId },
        data: { balance: { increment: transaction.net_revenue } },
      });

      // 5. Kirim Notif ke Mahasiswa kalau kelas udah dibuka
      await tx.notification.create({
        data: {
          user_id: transaction.student_id,
          title: "💳 Pembayaran Manual Disetujui!",
          message: `Selamat, akses kelas "${transaction.course.title}" telah dibuka oleh dosen. Selamat belajar!`,
        },
      });

      return updatedTx;
    });

    return result;
  }
};

module.exports = {
  submitManualPayment,
  getPendingTransactions,
  validateTransaction,
};
