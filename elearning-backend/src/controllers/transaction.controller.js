const { sendSuccess } = require("../utils/responseHandler");
const AppError = require("../utils/AppError");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ==========================================
// 1. BAYAR KELAS PAKAI POIN (AUTO-SUCCESS)
// ==========================================
const payWithPoints = async (req, res, next) => {
  try {
    const { course_id } = req.body;
    const studentId = req.user.id;

    // Cek apakah kelasnya ada dan berbayar
    const course = await prisma.course.findUnique({ where: { id: course_id } });
    if (!course) throw new AppError("Kelas tidak ditemukan", 404);
    if (course.type !== "PROJECT_BASED" || course.price === 0) {
      throw new AppError(
        "Kelas ini gratis coy, mending langsung enroll aja!",
        400,
      );
    }

    // Cek saldo Poin Mahasiswa
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (student.points < course.price) {
      throw new AppError(
        `Poin lu kurang coy! Butuh ${course.price} Poin, saldo lu cuma ${student.points} Poin.`,
        400,
      );
    }

    // Cek apakah mahasiswa udah punya kelasnya
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        student_id_course_id: { student_id: studentId, course_id: course_id },
      },
    });
    if (existingEnrollment)
      throw new AppError("Lu udah punya kelas ini coy!", 400);

    // 🔥 JALANKAN TRANSAKSI (Transaksi DB, bukan payment gateway)
    await prisma.$transaction([
      // 1. Potong saldo Poin Mahasiswa
      prisma.user.update({
        where: { id: studentId },
        data: { points: { decrement: course.price } },
      }),
      // 2. Catat di tabel Transaksi (Status Langsung SUCCESS karena pakai Poin)
      prisma.transaction.create({
        data: {
          student_id: studentId,
          course_id: course.id,
          amount: course.price,
          status: "SUCCESS",
          gateway_reference: "REDEEM_POINT_SYSTEM",
        },
      }),
      // 3. Langsung daftarkan Mahasiswa ke Kelas (Enrollment)
      prisma.enrollment.create({
        data: {
          student_id: studentId,
          course_id: course.id,
          enrolled_at: new Date(),
        },
      }),
    ]);

    return sendSuccess(res, 200, "Berhasil menukar Poin dengan Kelas Premium!");
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. UPLOAD BUKTI TRANSFER MANUAL
// ==========================================
const manualPayment = async (req, res, next) => {
  try {
    const { course_id } = req.body;
    const studentId = req.user.id;

    // Anggap lu pakai service upload terpisah, atau simpan URL dari body (kayak di MaterialChallenge)
    const receiptUrl = req.file ? req.file.path : req.body.receipt_url;

    if (!receiptUrl)
      throw new AppError("Bukti transfer wajib disertakan!", 400);

    const course = await prisma.course.findUnique({ where: { id: course_id } });
    if (!course) throw new AppError("Kelas tidak ditemukan", 404);

    // Buat Transaksi dengan status PENDING
    const transaction = await prisma.transaction.create({
      data: {
        student_id: studentId,
        course_id: course.id,
        amount: course.price,
        status: "PENDING",
        payment_url: receiptUrl,
        gateway_reference: "MANUAL_TRANSFER",
      },
    });

    return sendSuccess(
      res,
      201,
      "Bukti transfer berhasil dikirim. Menunggu validasi Instruktur.",
      { transaction },
    );
  } catch (error) {
    next(error);
  }
};

const unlockMaterialWithPoints = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { materialId } = req.body;

    // 1. Cari materinya buat tau harganya
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });
    if (!material) {
      return res.status(404).json({ message: "Materi tidak ditemukan coy!" });
    }

    const unlockPrice = material.unlock_points || 3000;

    // 2. Cek saldo poin mahasiswa
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.points < unlockPrice) {
      return res
        .status(400)
        .json({ message: `Poin kamu nggak cukup! Butuh ${unlockPrice} Pts.` });
    }

    // 3. Cek apakah udah pernah dibeli sebelumnya biar ga dobel potong
    const alreadyUnlocked = await prisma.materialUnlock.findUnique({
      where: {
        user_id_material_id: { user_id: userId, material_id: materialId },
      },
    });

    if (alreadyUnlocked) {
      return res
        .status(400)
        .json({ message: "Materi ini udah kebuka, silakan langsung belajar!" });
    }

    // 4. Proses Transaksi (Potong poin & Buka Gembok sekaligus pakai $transaction)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { points: { decrement: unlockPrice } },
      }),
      prisma.materialUnlock.create({
        data: {
          user_id: userId,
          material_id: materialId,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "💥 BOOM! Materi berhasil dibuka!",
      data: { pointsLeft: user.points - unlockPrice },
    });
  } catch (error) {
    console.error("Error unlock material:", error);
    next(error);
  }
};

module.exports = {
  payWithPoints,
  manualPayment,
  unlockMaterialWithPoints,
};
