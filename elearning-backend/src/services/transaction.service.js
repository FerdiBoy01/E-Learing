const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');

// 1. FUNGSI UNTUK MAHASISWA: Kirim Bukti Transfer
const submitManualPayment = async (studentId, courseId, receiptUrl) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError('Mata kuliah tidak ditemukan', 404);
  if (course.type !== 'PROJECT_BASED') throw new AppError('Kelas ini gratis, silakan langsung ambil', 400);

  // Cek apakah mahasiswa sudah punya transaksi yang masih PENDING
  const existingPending = await prisma.transaction.findFirst({
    where: { student_id: studentId, course_id: courseId, status: 'PENDING' }
  });
  if (existingPending) throw new AppError('Anda sudah mengirimkan bukti. Menunggu validasi dosen.', 400);

  // Simpan transaksi ke database (Link gambar kita simpan di payment_url)
  const transaction = await prisma.transaction.create({
    data: {
      student_id: studentId,
      course_id: courseId,
      amount: course.price,
      status: 'PENDING',
      payment_url: receiptUrl 
    }
  });

  return transaction;
};

// 2. FUNGSI UNTUK DOSEN: Ambil Daftar Transaksi yang Belum di-ACC
const getPendingTransactions = async (lecturerId) => {
  return await prisma.transaction.findMany({
    where: {
      status: 'PENDING',
      course: { lecturer_id: lecturerId } // Hanya tampilkan transaksi untuk kelas milik dosen ini
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true, price: true } }
    },
    orderBy: { created_at: 'asc' } // Yang paling lama bayar di atas
  });
};

// 3. FUNGSI UNTUK DOSEN: ACC atau TOLAK Pembayaran
const validateTransaction = async (transactionId, action, lecturerId) => {
  // action = 'APPROVE' atau 'REJECT'
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { course: true }
  });

  if (!transaction) throw new AppError('Transaksi tidak ditemukan', 404);
  if (transaction.course.lecturer_id !== lecturerId) throw new AppError('Akses ditolak', 403);
  if (transaction.status !== 'PENDING') throw new AppError('Transaksi ini sudah diproses', 400);

  // Jika Dosen Menolak
  if (action === 'REJECT') {
    return await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'FAILED' }
    });
  }

  // Jika Dosen Meng-ACC
  if (action === 'APPROVE') {
    // 1. Ubah status transaksi jadi SUCCESS
    const updatedTx = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'SUCCESS' }
    });

    // 2. OTO-ENROLL: Masukkan mahasiswa ke kelas tersebut (Buka akses)
    await prisma.enrollment.create({
      data: {
        student_id: transaction.student_id,
        course_id: transaction.course_id
      }
    });

    return updatedTx;
  }
};

module.exports = { submitManualPayment, getPendingTransactions, validateTransaction };