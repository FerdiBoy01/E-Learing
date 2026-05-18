const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendSuccess } = require("../utils/responseHandler");
const AppError = require("../utils/AppError");

// =========================================================================
// 1. AMBIL SALDO DOMPET & RIWAYAT TARIK TUNAI DOSEN
// =========================================================================
const getMyWallet = async (req, res, next) => {
  try {
    const lecturerId = req.user.id;

    // Ambil sisa saldo aktif di tabel user
    const lecturer = await prisma.user.findUnique({
      where: { id: lecturerId },
      select: { balance: true },
    });

    // Ambil riwayat penarikan dana
    const withdrawals = await prisma.withdrawal.findMany({
      where: { lecturer_id: lecturerId },
      orderBy: { created_at: "desc" },
    });

    return sendSuccess(res, 200, "Data dompet berhasil diambil", {
      balance: lecturer.balance,
      withdrawals,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 2. AJUKAN PENARIKAN DANA BARU
// =========================================================================
const requestWithdrawal = async (req, res, next) => {
  try {
    const lecturerId = req.user.id;
    const { amount, bank_name, account_number, account_name } = req.body;

    const lecturer = await prisma.user.findUnique({
      where: { id: lecturerId },
    });

    if (amount < 50000) throw new AppError("Minimal penarikan Rp 50.000", 400);
    if (lecturer.balance < amount)
      throw new AppError("Saldo tidak mencukupi!", 400);

    // 🔥 TRANSAKSI ATOMIK: Buat pengajuan & potong saldo sementara
    // Kalau nanti Admin menolak (REJECT), saldo ini bakal dibalikin lagi ke Dosen.
    const result = await prisma.$transaction([
      prisma.withdrawal.create({
        data: {
          lecturer_id: lecturerId,
          amount: amount,
          bank_name,
          account_number,
          account_name,
          status: "PENDING",
        },
      }),
      prisma.user.update({
        where: { id: lecturerId },
        data: { balance: { decrement: amount } },
      }),
    ]);

    return sendSuccess(
      res,
      201,
      "Permintaan pencairan berhasil dikirim ke Admin!",
      result[0],
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyWallet, requestWithdrawal };
