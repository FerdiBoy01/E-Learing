const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// =========================================================================
// 1. DASHBOARD DOSEN (LECTURER & CREATOR)
// =========================================================================
const getLecturerDashboard = async (lecturerId) => {
  // 1. Ambil Metrik Akademik Dasar
  const totalCourses = await prisma.course.count({
    where: { lecturer_id: lecturerId },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { course: { lecturer_id: lecturerId } },
    distinct: ["student_id"],
  });
  const totalStudents = enrollments.length;

  const pendingSubmissions = await prisma.submission.count({
    where: {
      material: { chapter: { course: { lecturer_id: lecturerId } } },
      status: "PENDING",
    },
  });

  const gradedSubmissions = await prisma.submission.count({
    where: {
      material: { chapter: { course: { lecturer_id: lecturerId } } },
      status: "GRADED",
    },
  });

  // =====================================================================
  // 🔥 FIX BUG REFRESH: AMBIL METRIK FINANSIAL DARI TABEL TRANSAKSI
  // =====================================================================
  const successfulTransactions = await prisma.transaction.findMany({
    where: {
      status: "SUCCESS", // Hanya hitung yang udah lunas/ACC
      course: { lecturer_id: lecturerId }, // Hanya transaksi untuk kelas milik dosen ini
    },
    include: {
      course: { select: { id: true, title: true } },
    },
  });

  // Hitung total bersih yang masuk ke dosen (dari kolom net_revenue)
  const totalRevenue = successfulTransactions.reduce(
    (sum, tx) => sum + (tx.net_revenue || 0),
    0,
  );
  const salesCount = successfulTransactions.length;

  // =====================================================================
  // 🔥 FIX BUG LEADERBOARD: HITUNG PERFORMA KELAS
  // =====================================================================
  const performanceMap = {};

  successfulTransactions.forEach((tx) => {
    const courseId = tx.course.id;
    if (!performanceMap[courseId]) {
      performanceMap[courseId] = {
        title: tx.course.title,
        sales_count: 0,
        revenue: 0,
      };
    }
    performanceMap[courseId].sales_count += 1;
    performanceMap[courseId].revenue += tx.net_revenue || 0;
  });

  // Urutkan dari yang pendapatannya paling gede ke paling kecil
  const coursePerformance = Object.values(performanceMap).sort(
    (a, b) => b.revenue - a.revenue,
  );

  // Return semua data ke Controller
  return {
    totalCourses,
    totalStudents,
    pendingSubmissions,
    gradedSubmissions,
    totalRevenue, // <-- Ini yang bakal ngisi angka Rp 0 jadi beneran
    salesCount, // <-- Ini yang ngisi jumlah transaksi
    coursePerformance, // <-- Ini buat tabel leaderboard
  };
};

// =========================================================================
// 2. DASHBOARD MAHASISWA (STUDENT)
// =========================================================================
const getStudentDashboard = async (studentId) => {
  // Ambil total kelas yang diikuti
  const totalEnrolled = await prisma.enrollment.count({
    where: { student_id: studentId },
  });

  // Ambil total kelas yang sudah tamat (100%)
  const completedCourses = await prisma.enrollment.count({
    where: { student_id: studentId, is_completed: true },
  });

  // Ambil materi terakhir yang diakses (Opsional, buat ngelanjutin belajar)
  const recentProgress = await prisma.studentProgress.findFirst({
    where: { student_id: studentId },
    orderBy: { completed_at: "desc" },
    include: {
      material: {
        select: { title: true, chapter: { select: { course_id: true } } },
      },
    },
  });

  return {
    totalEnrolled,
    completedCourses,
    recentProgress,
  };
};

module.exports = {
  getLecturerDashboard,
  getStudentDashboard,
};
