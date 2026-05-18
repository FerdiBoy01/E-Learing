const { sendSuccess } = require("../utils/responseHandler");
const AppError = require("../utils/AppError");
const { PrismaClient } = require("@prisma/client");
const midtransClient = require("midtrans-client");
const crypto = require("crypto");

const prisma = new PrismaClient();

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// =========================================================================
// 🔒 1. INISIASI TOKEN PEMBAYARAN MIDTRANS (SNAP GATEWAY)
// =========================================================================
const initiateMidtransPayment = async (req, res, next) => {
  try {
    const { course_id } = req.body;
    const studentId = req.user.id;

    const course = await prisma.course.findUnique({ where: { id: course_id } });
    if (!course)
      throw new AppError("Mata kuliah premium tidak ditemukan!", 404);
    if (course.type !== "PROJECT_BASED" || course.price <= 0) {
      throw new AppError(
        "Kelas ini gratis coy, tidak perlu modul pembayaran!",
        400,
      );
    }

    const existingEnroll = await prisma.enrollment.findUnique({
      where: { student_id_course_id: { student_id: studentId, course_id } },
    });
    if (existingEnroll)
      throw new AppError("Lu udah terdaftar di kelas premium ini, coy!", 400);

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    const orderId = `EPRATIA-${Date.now()}-${studentId.slice(0, 5)}`;

    // 🔥 PRE-CALCULATION: Hitung Platform Fee (20%) & Net Revenue (80%) di awal biar rapi
    const platformFee = Math.floor(course.price * 0.2);
    const netRevenue = course.price - platformFee;

    await prisma.transaction.create({
      data: {
        id: orderId,
        student_id: studentId,
        course_id: course.id,
        amount: course.price,
        platform_fee: platformFee, // Catat potongan Admin
        net_revenue: netRevenue, // Catat hak Dosen
        status: "PENDING",
        gateway_reference: "MIDTRANS_SNAP",
      },
    });

    const parameter = {
      transaction_details: { order_id: orderId, gross_amount: course.price },
      item_details: [
        {
          id: course.id,
          price: course.price,
          quantity: 1,
          name: course.title.slice(0, 50),
        },
      ],
      customer_details: { first_name: student.name, email: student.email },
      enabled_payments: [
        "credit_card",
        "mandiri_clickpay",
        "cimb_clicks",
        "bca_va",
        "bni_va",
        "bri_va",
        "gopay",
        "shopeepay",
      ],
    };

    const transactionToken = await snap.createTransactionToken(parameter);

    await prisma.transaction.update({
      where: { id: orderId },
      data: { payment_url: transactionToken },
    });

    return sendSuccess(res, 201, "Token pembayaran berhasil diproduksi!", {
      token: transactionToken,
      order_id: orderId,
      redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${transactionToken}`,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 🔒 2. WEBHOOK RECEIVER & INTEGRITY SECURITY GUARD (AUTO-UNLOCK & REVENUE SHARE)
// =========================================================================
const handleMidtransWebhook = async (req, res, next) => {
  try {
    const notificationPayload = req.body;
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = notificationPayload;

    const localSignatureSource = `${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`;
    const calculatedSignature = crypto
      .createHash("sha512")
      .update(localSignatureSource)
      .digest("hex");

    if (calculatedSignature !== signature_key) {
      console.error(`🚨 ALERT SIBER: Pembobolan Webhook dari IP: ${req.ip}`);
      return res
        .status(403)
        .json({
          success: false,
          message: "Tanda tangan digital palsu! Transaksi di-block.",
        });
    }

    const localTx = await prisma.transaction.findUnique({
      where: { id: order_id },
      include: { course: true },
    });

    if (!localTx)
      return res
        .status(404)
        .json({ success: false, message: "Order ID tidak terdaftar." });
    if (localTx.status === "SUCCESS" || localTx.status === "FAILED")
      return res
        .status(200)
        .json({
          success: true,
          message: "Transaksi sudah diproses sebelumnya.",
        });

    let finalPaymentStatus = "PENDING";
    if (transaction_status === "capture") {
      finalPaymentStatus = fraud_status === "accept" ? "SUCCESS" : "PENDING";
    } else if (transaction_status === "settlement") {
      finalPaymentStatus = "SUCCESS";
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      finalPaymentStatus = "FAILED";
    }

    if (finalPaymentStatus === "SUCCESS") {
      // 🔥 REVENUE SHARE ENGINE: Transaksi Atomik Pembagian Harta Karun
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: order_id },
          data: { status: "SUCCESS" },
        }),
        prisma.enrollment.create({
          data: {
            student_id: localTx.student_id,
            course_id: localTx.course_id,
            enrolled_at: new Date(),
          },
        }),
        prisma.notification.create({
          data: {
            user_id: localTx.student_id,
            title: "💳 Pembayaran Premium Sukses!",
            message: `Akses kelas "${localTx.course.title}" telah terbuka otomatis.`,
          },
        }),
        // 🔥 INJEKSI SALDO DOSEN: Tambahkan Net Revenue (80%) ke balance Dosen pembuat kelas
        prisma.user.update({
          where: { id: localTx.course.lecturer_id },
          data: { balance: { increment: localTx.net_revenue } },
        }),
        // 🔥 NOTIFIKASI DOSEN: Kasih tau kalau kelasnya laku keras
        prisma.notification.create({
          data: {
            user_id: localTx.course.lecturer_id,
            title: "💰 Kelas Anda Terjual!",
            message: `Hore! Mahasiswa telah membeli kelas "${localTx.course.title}". Saldo Anda bertambah Rp ${localTx.net_revenue.toLocaleString("id-ID")}.`,
          },
        }),
      ]);
      console.log(
        `🎉 REVENUE SHARE BERHASIL: Rp ${localTx.net_revenue} masuk ke kantong Dosen ${localTx.course.lecturer_id}`,
      );
    } else if (finalPaymentStatus === "FAILED") {
      await prisma.transaction.update({
        where: { id: order_id },
        data: { status: "FAILED" },
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Webhook terproses lancar!" });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. KODE LAMA SYSTEM (REDEEM POINT & MANUAL)
// ==========================================
const payWithPoints = async (req, res, next) => {
  try {
    const { course_id } = req.body;
    const studentId = req.user.id;
    const course = await prisma.course.findUnique({ where: { id: course_id } });
    if (!course) throw new AppError("Kelas tidak ditemukan", 404);

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (student.points < course.price) throw new AppError(`Poin kurang!`, 400);

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { student_id_course_id: { student_id: studentId, course_id } },
    });
    if (existingEnrollment)
      throw new AppError("Lu udah punya kelas ini coy!", 400);

    const orderId = `POINTS-${Date.now()}-${studentId.slice(0, 5)}`;

    // Hitung subsidi revenue (Karena pakai poin, kita asumsikan Dosen tetep dapet duit asli 80% dari harga, subsidi dari platform lu)
    const platformFee = Math.floor(course.price * 0.2);
    const netRevenue = course.price - platformFee;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: studentId },
        data: { points: { decrement: course.price } },
      }),
      prisma.transaction.create({
        data: {
          id: orderId,
          student_id: studentId,
          course_id: course.id,
          amount: course.price,
          platform_fee: platformFee,
          net_revenue: netRevenue,
          status: "SUCCESS",
          gateway_reference: "REDEEM_POINT_SYSTEM",
        },
      }),
      prisma.enrollment.create({
        data: {
          student_id: studentId,
          course_id: course.id,
          enrolled_at: new Date(),
        },
      }),
      // Tambah saldo dosen walau siswa bayar pakai poin (Asumsi platform lu bakar duit/subsidi)
      prisma.user.update({
        where: { id: course.lecturer_id },
        data: { balance: { increment: netRevenue } },
      }),
    ]);
    return sendSuccess(res, 200, "Berhasil menukar Poin dengan Kelas Premium!");
  } catch (error) {
    next(error);
  }
};

const manualPayment = async (req, res, next) => {
  try {
    const { course_id } = req.body;
    const studentId = req.user.id;
    const receiptUrl = req.file ? req.file.path : req.body.receipt_url;
    if (!receiptUrl)
      throw new AppError("Bukti transfer wajib disertakan!", 400);
    const course = await prisma.course.findUnique({ where: { id: course_id } });
    if (!course) throw new AppError("Kelas tidak ditemukan", 404);

    const orderId = `MANUAL-${Date.now()}-${studentId.slice(0, 5)}`;

    // Kalkulasi Manual Payment
    const platformFee = Math.floor(course.price * 0.2);
    const netRevenue = course.price - platformFee;

    const transaction = await prisma.transaction.create({
      data: {
        id: orderId,
        student_id: studentId,
        course_id: course.id,
        amount: course.price,
        platform_fee: platformFee,
        net_revenue: netRevenue,
        status: "PENDING",
        payment_url: receiptUrl,
        gateway_reference: "MANUAL_TRANSFER",
      },
    });
    return sendSuccess(res, 201, "Bukti transfer manual dikirim!", {
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

const unlockMaterialWithPoints = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { materialId } = req.body;
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });
    if (!material)
      return res.status(404).json({ message: "Materi tidak ditemukan!" });
    const unlockPrice = material.unlock_points || 3000;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.points < unlockPrice)
      return res.status(400).json({ message: "Poin tidak cukup!" });

    const alreadyUnlocked = await prisma.materialUnlock.findUnique({
      where: {
        user_id_material_id: { user_id: userId, material_id: materialId },
      },
    });
    if (alreadyUnlocked)
      return res.status(400).json({ message: "Materi sudah kebuka!" });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { points: { decrement: unlockPrice } },
      }),
      prisma.materialUnlock.create({
        data: { user_id: userId, material_id: materialId },
      }),
    ]);
    return res
      .status(200)
      .json({
        success: true,
        message: "Materi berhasil dibuka!",
        data: { pointsLeft: user.points - unlockPrice },
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiateMidtransPayment,
  handleMidtransWebhook,
  payWithPoints,
  manualPayment,
  unlockMaterialWithPoints,
};
