const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendSuccess } = require("../utils/responseHandler");
const bcrypt = require("bcrypt");

const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Hitung Total Users per Role
    const totalStudents = await prisma.user.count({
      where: { role: "STUDENT" },
    });
    const totalLecturers = await prisma.user.count({
      where: { role: "LECTURER" },
    });
    const totalCreators = await prisma.user.count({
      where: { role: "CREATOR" },
    });

    // 2. Hitung Total Kelas
    const totalCourses = await prisma.course.count();
    const publishedCourses = await prisma.course.count({
      where: { is_published: true },
    });

    // 3. Hitung Transaksi & Pendapatan (Hanya yang SUCCESS)
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
      finance: {
        totalRevenue,
        totalTransactions,
      },
    };

    return sendSuccess(res, 200, "Statistik Admin berhasil diambil", stats);
  } catch (error) {
    console.error("Gagal get admin stats:", error);
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

    // Cegah admin ngubah dirinya sendiri jadi student (biar ga bunuh diri)
    if (req.user.id === id) {
      return res
        .status(400)
        .json({ message: "Waduh, lu nggak bisa ngubah role lu sendiri coy!" });
    }

    if (!["STUDENT", "LECTURER", "CREATOR", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Role tidak valid!" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, role: true }, // Return secukupnya
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
        student: {
          select: {
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            title: true,
            type: true,
            price: true,
          },
        },
      },
      orderBy: { created_at: "desc" }, // Urutkan dari transaksi terbaru
    });

    return sendSuccess(
      res,
      200,
      "Daftar semua transaksi berhasil diambil",
      transactions,
    );
  } catch (error) {
    console.error("Gagal mengambil data transaksi admin:", error);
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Cek apakah email udah dipakai
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Gagal! Email ini sudah terdaftar coy." });
    }

    // 2. Enkripsi (Hash) Password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Simpan ke database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        role: role || "STUDENT",
      },
      select: { id: true, name: true, email: true, role: true }, // Jangan kirim balik passwordnya
    });

    return sendSuccess(
      res,
      201,
      `Akun ${newUser.name} berhasil dibuat dengan akses ${newUser.role}!`,
    );
  } catch (error) {
    console.error("Gagal buat user dari admin:", error);
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
        chapters: {
          include: { materials: true }, // Admin bisa liat isi materi
        },
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
    // Admin nentuin poin & exp berdasarkan tingkat kesulitan

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        status, // APPROVED atau REJECTED
        reward_points: parseInt(reward_points),
        reward_exp: parseInt(reward_exp),
        is_published: status === "APPROVED", // Otomatis publish kalau di-ACC
      },
    });

    return sendSuccess(res, 200, `Kelas berhasil di-${status}!`);
  } catch (error) {
    next(error);
  }
};

// module.exports = { ..., getCourseDetailForReview, approveCourse }

// JANGAN LUPA DAFTARKAN DI EXPORT NYA COY
module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  getAllTransactions,
  createUser,
  getCourseDetailForReview,
  approveCourse,
};
