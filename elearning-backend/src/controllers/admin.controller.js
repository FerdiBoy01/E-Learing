// =========================================================================
// 🔒 INITIALIZATION ENGINE: CORE PRIVILEGES CONTROL
// =========================================================================
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { sendSuccess } = require("../utils/responseHandler");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await prisma.user.count({
      where: { role: "STUDENT" },
    });
    const totalLecturers = await prisma.user.count({
      where: { role: "LECTURER" },
    });
    const totalCreators = await prisma.user.count({
      where: { role: "CREATOR" },
    });

    const totalCourses = await prisma.course.count();
    const publishedCourses = await prisma.course.count({
      where: { is_published: true },
    });

    const successfulTransactions = await prisma.transaction.findMany({
      where: { status: "SUCCESS" },
      select: { amount: true },
    });

    const totalRevenue = successfulTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0,
    );
    const totalTransactions = await prisma.transaction.count();

    const stats = {
      users: {
        students: totalStudents,
        lecturers: totalLecturers,
        creators: totalCreators,
        total: totalStudents + totalLecturers + totalCreators,
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        draft: totalCourses - publishedCourses,
      },
      finance: { totalRevenue, totalTransactions },
    };

    return sendSuccess(res, 200, "Statistik Admin berhasil diambil", stats);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        exp: true,
        level: true,
        points: true,
      },
      orderBy: { created_at: "desc" },
    });
    return sendSuccess(res, 200, "Daftar semua user", users);
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (req.user.id === id)
      return res
        .status(400)
        .json({ message: "Waduh, lu nggak bisa ngubah role lu sendiri coy!" });
    if (!["STUDENT", "LECTURER", "CREATOR", "ADMIN", "BANNED"].includes(role))
      return res.status(400).json({ message: "Role tidak valid!" });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, role: true },
    });
    return sendSuccess(
      res,
      200,
      `Role ${updatedUser.name} berhasil diubah jadi ${role}`,
    );
  } catch (error) {
    next(error);
  }
};

const getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        student: { select: { name: true, email: true } },
        course: { select: { title: true, type: true, price: true } },
      },
      orderBy: { created_at: "desc" },
    });
    return sendSuccess(
      res,
      200,
      "Daftar semua transaksi berhasil diambil",
      transactions,
    );
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "Gagal! Email ini sudah terdaftar coy." });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: { name, email, password_hash, role: role || "STUDENT" },
      select: { id: true, name: true, email: true, role: true },
    });
    return sendSuccess(
      res,
      201,
      `Akun ${newUser.name} berhasil dibuat dengan akses ${newUser.role}!`,
    );
  } catch (error) {
    next(error);
  }
};

const getCourseDetailForReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lecturer: { select: { name: true, email: true } },
        chapters: { include: { materials: true } },
      },
    });
    return sendSuccess(res, 200, "Data review kelas berhasil diambil", course);
  } catch (error) {
    next(error);
  }
};

const approveCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reward_points, reward_exp } = req.body;

    const isPublished = status === "APPROVED";
    const points = parseInt(reward_points) || 0;
    const exp = parseInt(reward_exp) || 500;

    await prisma.$executeRaw`
      UPDATE "courses" 
      SET "status" = ${status}::"ApprovalStatus", "reward_points" = ${points}, "reward_exp" = ${exp}, "is_published" = ${isPublished}, "takedown_reason" = NULL 
      WHERE "id" = ${id}
    `;

    if (status === "APPROVED") {
      const course = await prisma.course.findUnique({
        where: { id },
        select: { title: true, lecturer_id: true },
      });
      if (course) {
        const notifId = crypto.randomUUID();
        await prisma.$executeRaw`
          INSERT INTO "notifications" ("id", "user_id", "title", "message", "is_read", "created_at") 
          VALUES (${notifId}, ${course.lecturer_id}, '🎉 Kurikulum Anda Lolos Quality Gate!', ${`Selamat! Kelas "${course.title}" telah disetujui oleh Superadmin dan otomatis diterbitkan ke katalog.`}, false, NOW())
        `;
      }
    }
    return sendSuccess(res, 200, `Kelas berhasil di-${status} dengan aman!`);
  } catch (error) {
    next(error);
  }
};

const forceTakedownCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { takedown_reason } = req.body;
    if (!takedown_reason)
      return res
        .status(400)
        .json({
          success: false,
          message: "Wajib memberikan alasan takedown untuk dosen!",
        });

    const course = await prisma.course.findUnique({
      where: { id },
      select: { title: true, lecturer_id: true },
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Kurikulum tidak ditemukan!" });

    await prisma.$executeRaw`
      UPDATE "courses" 
      SET "status" = 'REJECTED'::"ApprovalStatus", "is_published" = false, "visibility" = 'PRIVATE'::"CourseVisibility", "takedown_reason" = ${takedown_reason} 
      WHERE "id" = ${id}
    `;

    const notifId = crypto.randomUUID();
    const notifMessage = `Kurikulum "${course.title}" telah disembunyikan oleh Superadmin. Alasan Pelanggaran: ${takedown_reason}`;
    await prisma.$executeRaw`
      INSERT INTO "notifications" ("id", "user_id", "title", "message", "is_read", "created_at") 
      VALUES (${notifId}, ${course.lecturer_id}, '🚨 Kelas Anda Diturunkan Paksa (Takedown)!', ${notifMessage}, false, NOW())
    `;
    return sendSuccess(
      res,
      200,
      "Takedown berhasil & Notifikasi telah meluncur aman!",
    );
  } catch (error) {
    next(error);
  }
};

const restoreCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
      select: { title: true, lecturer_id: true },
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Kurikulum tidak ditemukan!" });

    await prisma.$executeRaw`
      UPDATE "courses" 
      SET "status" = 'APPROVED'::"ApprovalStatus", "is_published" = true, "visibility" = 'PUBLIC'::"CourseVisibility", "takedown_reason" = NULL 
      WHERE "id" = ${id}
    `;

    const notifId = crypto.randomUUID();
    const notifMessage = `Selamat, kurikulum "${course.title}" telah disetujui kembali oleh Superadmin dan sudah mengudara di halaman publik.`;
    await prisma.$executeRaw`
      INSERT INTO "notifications" ("id", "user_id", "title", "message", "is_read", "created_at") 
      VALUES (${notifId}, ${course.lecturer_id}, '🔄 Kelas Anda Berhasil Dipulihkan!', ${notifMessage}, false, NOW())
    `;
    return sendSuccess(res, 200, "Kelas berhasil dipulihkan aman ke Publik!");
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 💸 10. GET ALL WITHDRAWAL REQUESTS (MESIN KASIR ADMIN)
// =========================================================================
const getAllWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        lecturer: {
          select: { name: true, email: true },
        },
      },
      orderBy: { created_at: "desc" },
    });
    return sendSuccess(
      res,
      200,
      "Daftar penarikan dana berhasil diambil",
      withdrawals,
    );
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 💸 11. PROCESS WITHDRAWAL (APPROVE / REJECT) - 🔒 SECURE TRANSACTION
// =========================================================================
const processWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'APPROVE' atau 'REJECT'

    if (!["APPROVE", "REJECT"].includes(action)) {
      return res
        .status(400)
        .json({ success: false, message: "Action tidak valid!" });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: { lecturer: true },
    });

    if (!withdrawal)
      return res
        .status(404)
        .json({ success: false, message: "Data penarikan tidak ditemukan!" });
    if (withdrawal.status !== "PENDING")
      return res
        .status(400)
        .json({
          success: false,
          message: "Penarikan ini sudah diproses sebelumnya!",
        });

    // 🔥 JIKA DITOLAK: Kembalikan uangnya ke dompet Dosen secara atomik!
    if (action === "REJECT") {
      await prisma.$transaction(async (tx) => {
        await tx.withdrawal.update({
          where: { id },
          data: { status: "REJECTED" },
        });
        await tx.user.update({
          where: { id: withdrawal.lecturer_id },
          data: { balance: { increment: withdrawal.amount } }, // Refund
        });
        await tx.notification.create({
          data: {
            user_id: withdrawal.lecturer_id,
            title: "❌ Penarikan Dana Ditolak",
            message: `Permintaan penarikan dana Rp ${withdrawal.amount.toLocaleString("id-ID")} ke ${withdrawal.bank_name} ditolak oleh Admin. Saldo telah dikembalikan utuh ke dompet Anda.`,
          },
        });
      });
      return sendSuccess(
        res,
        200,
        "Penarikan berhasil ditolak, saldo otomatis dikembalikan ke Dosen.",
      );
    }

    // 🔥 JIKA DI-ACC: Tandai sukses, uang sudah keluar
    if (action === "APPROVE") {
      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id },
          data: { status: "APPROVED" },
        }),
        prisma.notification.create({
          data: {
            user_id: withdrawal.lecturer_id,
            title: "💸 Penarikan Dana Berhasil!",
            message: `Hore! Dana sebesar Rp ${withdrawal.amount.toLocaleString("id-ID")} telah sukses ditransfer oleh Admin ke rekening ${withdrawal.bank_name} Anda. Silakan cek mutasi rekening.`,
          },
        }),
      ]);
      return sendSuccess(
        res,
        200,
        "Penarikan berhasil di-ACC dan ditandai sebagai Lunas!",
      );
    }
  } catch (error) {
    console.error("Gagal memproses withdrawal admin:", error);
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  getAllTransactions,
  createUser,
  getCourseDetailForReview,
  approveCourse,
  forceTakedownCourse,
  restoreCourse,
  getAllWithdrawals,
  processWithdrawal, // <-- Экspor fungsi baru
};
